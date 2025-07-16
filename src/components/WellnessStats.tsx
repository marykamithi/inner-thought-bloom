import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Smile, BarChart3, Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Memory {
  id: string;
  content: string;
  created_at: string;
  sentiment_label: string | null;
  sentiment_score: number | null;
}

interface WellnessStats {
  totalEntries: number;
  entriesThisWeek: number;
  averageMood: string;
  streak: number;
  moodDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export function WellnessStats() {
  const [stats, setStats] = useState<WellnessStats>({
    totalEntries: 0,
    entriesThisWeek: 0,
    averageMood: 'neutral',
    streak: 0,
    moodDistribution: {
      positive: 0,
      neutral: 0,
      negative: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAndCalculateStats();
      
      // Set up real-time subscription to refresh stats when memories change
      const subscription = supabase
        .channel('wellness-stats')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'memories',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchAndCalculateStats();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchAndCalculateStats = async () => {
    try {
      const { data: memories, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (memories && memories.length > 0) {
        const calculatedStats = calculateStats(memories);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error fetching memories for stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (memories: Memory[]): WellnessStats => {
    const totalEntries = memories.length;
    
    // Calculate entries this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const entriesThisWeek = memories.filter(memory => 
      new Date(memory.created_at) >= oneWeekAgo
    ).length;

    // Calculate mood distribution
    const moodCounts = memories.reduce((acc, memory) => {
      const mood = memory.sentiment_label || 'neutral';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const positive = totalEntries > 0 ? Math.round(((moodCounts.positive || 0) / totalEntries) * 100) : 0;
    const negative = totalEntries > 0 ? Math.round(((moodCounts.negative || 0) / totalEntries) * 100) : 0;
    const neutral = totalEntries > 0 ? 100 - positive - negative : 0;

    // Determine average mood based on highest percentage
    let averageMood = 'neutral';
    if (totalEntries > 0) {
      const maxCount = Math.max(positive, negative, neutral);
      if (maxCount === positive) averageMood = 'positive';
      else if (maxCount === negative) averageMood = 'negative';
      else averageMood = 'neutral';
    }

    // Calculate streak (consecutive days with entries)
    const streak = calculateStreak(memories);

    return {
      totalEntries,
      entriesThisWeek,
      averageMood,
      streak,
      moodDistribution: {
        positive,
        neutral,
        negative
      }
    };
  };

  const calculateStreak = (memories: Memory[]): number => {
    if (memories.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get unique days with memories
    const uniqueDays = new Set<number>();
    memories.forEach(memory => {
      const memoryDate = new Date(memory.created_at);
      memoryDate.setHours(0, 0, 0, 0);
      uniqueDays.add(memoryDate.getTime());
    });

    // Sort days in descending order (most recent first)
    const sortedDays = Array.from(uniqueDays).sort((a, b) => (b as number) - (a as number));
    
    let streak = 0;
    let expectedDate = today.getTime();
    
    // Check if there's an entry today or yesterday to start the streak
    const hasEntryToday = sortedDays.includes(today.getTime());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const hasEntryYesterday = sortedDays.includes(yesterday.getTime());
    
    if (!hasEntryToday && !hasEntryYesterday) {
      return 0; // No recent activity
    }
    
    // Start from today or yesterday, whichever has an entry
    if (hasEntryToday) {
      expectedDate = today.getTime();
    } else {
      expectedDate = yesterday.getTime();
    }
    
    // Count consecutive days
    for (const day of sortedDays) {
      if (day === expectedDate) {
        streak++;
        expectedDate -= 24 * 60 * 60 * 1000; // Move to previous day
      } else if (day < expectedDate) {
        // Gap found, stop counting
        break;
      }
    }
    
    return streak;
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BarChart3 className="h-6 w-6 text-primary animate-float" />
          <h2 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Your Wellness Journey
          </h2>
          <Sparkles className="h-6 w-6 text-primary-glow animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <p className="text-muted-foreground">
          Insights into your mental wellness patterns and progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.totalEntries === 0 ? (
          <div className="col-span-full">
            <Card className="shadow-card bg-gradient-card border-0">
              <CardContent className="text-center py-12">
                <Heart className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No Memories Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start writing your first memory to see your wellness statistics here!
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
        {/* Total Entries */}
        <Card className="shadow-card bg-gradient-card border-0 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Total Memories</CardTitle>
              <Heart className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalEntries}</div>
            <div className="text-xs text-muted-foreground mt-1">Collected so far</div>
          </CardContent>
        </Card>

        {/* This Week */}
        <Card className="shadow-card bg-gradient-card border-0 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.entriesThisWeek}</div>
            <div className="text-xs text-muted-foreground mt-1">New entries</div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="shadow-card bg-gradient-card border-0 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.streak}</div>
            <div className="text-xs text-muted-foreground mt-1">Days in a row</div>
          </CardContent>
        </Card>

        {/* Average Mood */}
        <Card className="shadow-card bg-gradient-card border-0 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Average Mood</CardTitle>
              <Smile className={`h-4 w-4 ${getMoodColor(stats.averageMood)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold capitalize ${getMoodColor(stats.averageMood)}`}>
              {stats.averageMood}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Overall feeling</div>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      {/* Mood Distribution */}
      {stats.totalEntries > 0 && (
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Mood Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.moodDistribution).map(([mood, percentage]) => (
              <div key={mood} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      mood === 'positive' ? 'bg-green-500' :
                      mood === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm font-medium capitalize">{mood}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      mood === 'positive' ? 'bg-green-500' :
                      mood === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* AI Insights Placeholder */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Wellness Insights
            <Badge variant="secondary" className="text-xs ml-2">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-accent/20 rounded-lg p-6 text-center border border-accent/30">
            <Sparkles className="h-12 w-12 text-primary/50 mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">Advanced Analytics Coming Soon</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect to Supabase to unlock AI-powered insights including:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>📊 Sentiment trends over time</div>
              <div>🎯 Personalized wellness tips</div>
              <div>☁️ Word cloud analysis</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}