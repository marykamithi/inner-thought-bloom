import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Droplets, Moon, Activity, Zap, Gauge, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DailyMetrics {
  id?: string;
  date: string;
  sleep_hours: number;
  exercise_minutes: number;
  water_glasses: number;
  energy_level: number;
  stress_level: number;
}

export function WellnessTracker() {
  const [todayMetrics, setTodayMetrics] = useState<DailyMetrics>({
    date: new Date().toISOString().split('T')[0],
    sleep_hours: 8,
    exercise_minutes: 30,
    water_glasses: 8,
    energy_level: 5,
    stress_level: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTodayMetrics();
    }
  }, [user]);

  const fetchTodayMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('wellness_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setTodayMetrics({
          id: data.id,
          date: data.date,
          sleep_hours: data.sleep_hours || 8,
          exercise_minutes: data.exercise_minutes || 30,
          water_glasses: data.water_glasses || 8,
          energy_level: data.energy_level || 5,
          stress_level: data.stress_level || 5,
        });
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('wellness_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', weekAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const averages = {
          sleep: (data.reduce((sum, d) => sum + (d.sleep_hours || 0), 0) / data.length).toFixed(1),
          exercise: Math.round(data.reduce((sum, d) => sum + (d.exercise_minutes || 0), 0) / data.length),
          water: (data.reduce((sum, d) => sum + (d.water_glasses || 0), 0) / data.length).toFixed(1),
          energy: (data.reduce((sum, d) => sum + (d.energy_level || 0), 0) / data.length).toFixed(1),
          stress: (data.reduce((sum, d) => sum + (d.stress_level || 0), 0) / data.length).toFixed(1),
          daysTracked: data.length
        };
        setWeeklyStats(averages);
      }
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
    }
  };

  const saveMetrics = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (todayMetrics.id) {
        // Update existing
        const { error } = await supabase
          .from('wellness_metrics')
          .update({
            sleep_hours: todayMetrics.sleep_hours,
            exercise_minutes: todayMetrics.exercise_minutes,
            water_glasses: todayMetrics.water_glasses,
            energy_level: todayMetrics.energy_level,
            stress_level: todayMetrics.stress_level,
          })
          .eq('id', todayMetrics.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('wellness_metrics')
          .insert({
            user_id: user.id,
            date: today,
            sleep_hours: todayMetrics.sleep_hours,
            exercise_minutes: todayMetrics.exercise_minutes,
            water_glasses: todayMetrics.water_glasses,
            energy_level: todayMetrics.energy_level,
            stress_level: todayMetrics.stress_level,
          })
          .select()
          .single();

        if (error) throw error;
        
        setTodayMetrics(prev => ({ ...prev, id: data.id }));
      }

      toast({
        title: "Metrics saved! 📊",
        description: "Your wellness data has been recorded for today.",
      });

      // Fetch updated weekly stats and show summary
      await fetchWeeklyStats();
      setShowSummary(true);
      
      // Auto-hide summary after 10 seconds
      setTimeout(() => {
        setShowSummary(false);
      }, 10000);

    } catch (error: any) {
      toast({
        title: "Error saving metrics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateMetric = (key: keyof DailyMetrics, value: number) => {
    setTodayMetrics(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Daily Wellness Tracker
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date().toLocaleDateString()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your daily wellness metrics to monitor your health patterns
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Sleep Hours */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Sleep Hours</span>
              </div>
              <Badge variant="outline">{todayMetrics.sleep_hours.toFixed(1)} hours</Badge>
            </div>
            <Slider
              value={[todayMetrics.sleep_hours]}
              onValueChange={([value]) => updateMetric('sleep_hours', value)}
              min={0}
              max={12}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0h</span>
              <span>12h</span>
            </div>
          </div>

          {/* Exercise Minutes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="font-medium">Exercise</span>
              </div>
              <Badge variant="outline">{todayMetrics.exercise_minutes} minutes</Badge>
            </div>
            <Slider
              value={[todayMetrics.exercise_minutes]}
              onValueChange={([value]) => updateMetric('exercise_minutes', value)}
              min={0}
              max={180}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 min</span>
              <span>180 min</span>
            </div>
          </div>

          {/* Water Glasses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-cyan-500" />
                <span className="font-medium">Water Intake</span>
              </div>
              <Badge variant="outline">{todayMetrics.water_glasses} glasses</Badge>
            </div>
            <Slider
              value={[todayMetrics.water_glasses]}
              onValueChange={([value]) => updateMetric('water_glasses', value)}
              min={0}
              max={15}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 glasses</span>
              <span>15 glasses</span>
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Energy Level</span>
              </div>
              <Badge variant="outline">{todayMetrics.energy_level}/10</Badge>
            </div>
            <Slider
              value={[todayMetrics.energy_level]}
              onValueChange={([value]) => updateMetric('energy_level', value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Low</span>
              <span>Very High</span>
            </div>
          </div>

          {/* Stress Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-red-500" />
                <span className="font-medium">Stress Level</span>
              </div>
              <Badge variant="outline">{todayMetrics.stress_level}/10</Badge>
            </div>
            <Slider
              value={[todayMetrics.stress_level]}
              onValueChange={([value]) => updateMetric('stress_level', value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Low</span>
              <span>Very High</span>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button 
              onClick={saveMetrics}
              disabled={saving}
              className="w-full bg-gradient-hero"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Today's Metrics"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary Report */}
      {showSummary && weeklyStats && (
        <Card className="shadow-card bg-gradient-card border-0 animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Wellness Summary
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSummary(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Your wellness trends over the past {weeklyStats.daysTracked} days
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-background/60 rounded-lg">
                <Moon className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Avg Sleep</div>
                <div className="text-lg font-semibold">{weeklyStats.sleep}h</div>
              </div>
              
              <div className="text-center p-3 bg-background/60 rounded-lg">
                <Activity className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Avg Exercise</div>
                <div className="text-lg font-semibold">{weeklyStats.exercise}min</div>
              </div>
              
              <div className="text-center p-3 bg-background/60 rounded-lg">
                <Droplets className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Avg Water</div>
                <div className="text-lg font-semibold">{weeklyStats.water} glasses</div>
              </div>
              
              <div className="text-center p-3 bg-background/60 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Avg Energy</div>
                <div className="text-lg font-semibold">{weeklyStats.energy}/10</div>
              </div>
              
              <div className="text-center p-3 bg-background/60 rounded-lg">
                <Gauge className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Avg Stress</div>
                <div className="text-lg font-semibold">{weeklyStats.stress}/10</div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Weekly Insights</span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                {parseFloat(weeklyStats.sleep) >= 7 ? 
                  "✅ Great sleep patterns this week!" : 
                  "💤 Consider prioritizing more sleep for better wellness."}
                <br />
                {parseInt(weeklyStats.exercise) >= 30 ? 
                  "🏃‍♀️ Excellent exercise consistency!" : 
                  "🚶‍♀️ Try to increase daily movement for better health."}
                <br />
                {parseFloat(weeklyStats.energy) >= 6 ? 
                  "⚡ Strong energy levels maintained!" : 
                  "🔋 Focus on rest and nutrition to boost energy."}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
