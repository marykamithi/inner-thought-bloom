import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Activity, Target, Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Analytics {
  moodTrends: Array<{ date: string; mood: number; entries: number }>;
  weeklyActivity: Array<{ day: string; entries: number; avgMood: number }>;
  moodDistribution: Array<{ name: string; value: number; color: string }>;
  wellnessScore: number;
  insights: string[];
}

export function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics>({
    moodTrends: [],
    weeklyActivity: [],
    moodDistribution: [],
    wellnessScore: 0,
    insights: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch memories for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: memories, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (memories) {
        const processedAnalytics = processAnalyticsData(memories);
        setAnalytics(processedAnalytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (memories: any[]): Analytics => {
    // Process mood trends over time
    const moodTrends = memories.map(memory => ({
      date: new Date(memory.created_at).toLocaleDateString(),
      mood: getMoodScore(memory.sentiment_label),
      entries: 1
    }));

    // Group by date and calculate averages
    const groupedByDate = moodTrends.reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = { totalMood: 0, count: 0 };
      }
      acc[curr.date].totalMood += curr.mood;
      acc[curr.date].count += 1;
      return acc;
    }, {} as Record<string, { totalMood: number; count: number }>);

    const processedMoodTrends = Object.entries(groupedByDate).map(([date, data]) => ({
      date,
      mood: Math.round((data.totalMood / data.count) * 10) / 10,
      entries: data.count
    }));

    // Weekly activity
    const weeklyActivity = generateWeeklyActivity(memories);

    // Mood distribution
    const moodCounts = memories.reduce((acc, memory) => {
      const mood = memory.sentiment_label || 'neutral';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const moodDistribution = [
      { name: 'Positive', value: moodCounts.positive || 0, color: '#22c55e' },
      { name: 'Neutral', value: moodCounts.neutral || 0, color: '#eab308' },
      { name: 'Negative', value: moodCounts.negative || 0, color: '#ef4444' }
    ];

    // Calculate wellness score
    const totalEntries = memories.length;
    const positiveEntries = moodCounts.positive || 0;
    const wellnessScore = totalEntries > 0 ? Math.round((positiveEntries / totalEntries) * 100) : 0;

    // Generate insights
    const insights = generateInsights(memories, wellnessScore);

    return {
      moodTrends: processedMoodTrends,
      weeklyActivity,
      moodDistribution,
      wellnessScore,
      insights
    };
  };

  const getMoodScore = (sentiment: string | null): number => {
    switch (sentiment) {
      case 'positive': return 4;
      case 'negative': return 2;
      default: return 3;
    }
  };

  const generateWeeklyActivity = (memories: any[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = days.map(day => ({ day, entries: 0, totalMood: 0 }));

    memories.forEach(memory => {
      const dayIndex = new Date(memory.created_at).getDay();
      weekData[dayIndex].entries += 1;
      weekData[dayIndex].totalMood += getMoodScore(memory.sentiment_label);
    });

    return weekData.map(data => ({
      ...data,
      avgMood: data.entries > 0 ? Math.round((data.totalMood / data.entries) * 10) / 10 : 0
    }));
  };

  const generateInsights = (memories: any[], wellnessScore: number): string[] => {
    const insights = [];

    if (wellnessScore >= 70) {
      insights.push("🌟 You're maintaining excellent mental wellness! Keep up the great work.");
    } else if (wellnessScore >= 50) {
      insights.push("💪 Your wellness journey is on track. Consider adding more self-care activities.");
    } else {
      insights.push("🤗 Remember to be kind to yourself. Consider reaching out for support if needed.");
    }

    const recentEntries = memories.slice(-7);
    if (recentEntries.length >= 5) {
      insights.push("📝 Great job maintaining a consistent journaling habit this week!");
    }

    if (memories.length > 0) {
      const avgWordsPerEntry = memories.reduce((acc, memory) => acc + memory.content.length, 0) / memories.length;
      if (avgWordsPerEntry > 200) {
        insights.push("✍️ Your entries are wonderfully detailed and reflective.");
      }
    }

    return insights;
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
          <Brain className="h-6 w-6 text-primary animate-float" />
          <h2 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Wellness Analytics
          </h2>
        </div>
        <p className="text-muted-foreground">
          Deep insights into your mental wellness patterns
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wellness Score</p>
                <p className="text-2xl font-bold text-primary">{analytics.wellnessScore}%</p>
              </div>
              <Target className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily Entries</p>
                <p className="text-2xl font-bold text-foreground">
                  {(analytics.moodTrends.reduce((acc, curr) => acc + curr.entries, 0) / Math.max(analytics.moodTrends.length, 1)).toFixed(1)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">7 days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground">{analytics.moodTrends.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trends */}
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Mood Trends (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.moodTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis domain={[1, 5]} stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Weekly Activity Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="entries" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Mood Distribution & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.moodDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {analytics.moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Wellness Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.insights.map((insight, index) => (
                <div key={index} className="p-3 bg-accent/20 rounded-lg border border-accent/30">
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
