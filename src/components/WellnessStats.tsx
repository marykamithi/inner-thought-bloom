import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Smile, BarChart3, Heart, Sparkles } from "lucide-react";

export function WellnessStats() {
  // Sample data for demonstration
  const stats = {
    totalEntries: 24,
    entriesThisWeek: 5,
    averageMood: 'positive',
    streak: 7,
    mostActiveDay: 'Tuesday',
    moodDistribution: {
      positive: 60,
      neutral: 30,
      negative: 10
    }
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
      </div>

      {/* Mood Distribution */}
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