import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Target, Calendar, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Goal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  target_date?: string;
}

export function WellnessGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('wellness_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim() || !user) return;
    
    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('wellness_goals')
        .insert({
          user_id: user.id,
          title: newGoal,
          description: newDescription || null,
          target_date: targetDate || null,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      setGoals([data, ...goals]);
      setNewGoal("");
      setNewDescription("");
      setTargetDate("");
      
      toast({
        title: "Goal added! 🎯",
        description: "Your wellness goal has been set.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding goal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const toggleGoal = async (goalId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('wellness_goals')
        .update({ completed: !completed })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, completed: !completed }
          : goal
      ));

      toast({
        title: completed ? "Goal unchecked" : "Goal completed! 🎉",
        description: completed ? "Keep working towards it!" : "Great progress on your wellness journey!",
      });
    } catch (error: any) {
      toast({
        title: "Error updating goal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-card bg-gradient-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Wellness Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new goal */}
        <div className="space-y-3 p-4 border border-accent/30 rounded-lg">
          <Input
            placeholder="Dream big! What wellness goal inspires you? (e.g., 'Feel more energized daily', 'Practice mindfulness', 'Build healthy sleep habits')"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
          />
          <Textarea
            placeholder="Paint the picture... Why is this goal meaningful to you? How will achieving it transform your daily life and well-being?"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={addGoal}
              disabled={!newGoal.trim() || isAdding}
              className="bg-gradient-hero"
            >
              {isAdding ? "Adding..." : "Add Goal"}
            </Button>
          </div>
        </div>

        {/* Goals list */}
        <div className="space-y-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                goal.completed 
                  ? 'border-green-200 bg-green-50/50' 
                  : 'border-accent/30 bg-background/50'
              }`}
            >
              <button
                onClick={() => toggleGoal(goal.id, goal.completed)}
                className="text-primary hover:scale-110 transition-transform"
              >
                {goal.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              
              <div className="flex-1">
                <p className={`${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {goal.title}
                </p>
                {goal.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {goal.description}
                  </p>
                )}
                {goal.target_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(goal.target_date).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {goal.completed && (
                  <Badge variant="secondary" className="text-xs">
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          ))}
          
          {goals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No wellness goals yet. Add your first goal above!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
