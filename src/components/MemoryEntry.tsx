import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, PenTool, Sparkles, Target, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MoodSelector } from "./MoodSelector";
import { JournalPrompts } from "./JournalPrompts";
import { WellnessGoals } from "./WellnessGoals";
import { VoiceToText } from "./VoiceToText";

interface MemoryEntry {
  id: string;
  content: string;
  timestamp: Date;
  mood?: 'positive' | 'neutral' | 'negative';
  aiSentiment?: string;
}

export function MemoryEntry() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [moodIntensity, setMoodIntensity] = useState<number>(3);
  const [activeTab, setActiveTab] = useState("write");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleMoodSelect = (mood: string, intensity: number) => {
    setSelectedMood(mood);
    setMoodIntensity(intensity);
  };

  const handleVoiceText = (text: string) => {
    setContent(prev => prev + " " + text);
  };

  const handlePromptSelect = (prompt: string) => {
    setContent(prompt + "\n\n");
    setActiveTab("write");
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Get AI sentiment analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-sentiment', {
        body: { content }
      });

      if (analysisError) {
        console.error('AI analysis error:', analysisError);
      }

      // Save memory to database
      const { error: dbError } = await supabase
        .from('memories')
        .insert({
          user_id: user.id,
          content,
          sentiment_score: analysisData?.sentiment_score || null,
          sentiment_label: selectedMood || analysisData?.sentiment_label || null,
          ai_feedback: analysisData?.feedback || null,
          mood_intensity: moodIntensity || null,
        });

      if (dbError) {
        throw dbError;
      }

      setAiFeedback(analysisData?.feedback || null);
      setContent("");
      setSelectedMood("");
      setMoodIntensity(3);
      toast({
        title: "Memory saved! ✨",
        description: "Your thoughts have been safely stored with AI insights.",
      });
    } catch (error: any) {
      console.error('Error saving memory:', error);
      toast({
        title: "Error saving memory",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="write" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            Write
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Prompts
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-6">
          <Card className="w-full shadow-card bg-gradient-card border-0 overflow-hidden">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-primary animate-float" />
                <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
                  Capture Your Memory
                </CardTitle>
                <Sparkles className="h-5 w-5 text-primary-glow animate-float" style={{ animationDelay: '2s' }} />
              </div>
              <p className="text-muted-foreground text-sm">
                Write about your day, your feelings, or anything on your mind
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Mood Selector */}
              <MoodSelector 
                onMoodSelect={handleMoodSelect}
                selectedMood={selectedMood}
                selectedIntensity={moodIntensity}
              />

              <div className="relative">
                <Textarea
                  placeholder="What's on your mind today? Share your thoughts, feelings, or memories..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none border-2 border-accent/30 focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-all duration-300"
                  disabled={isSubmitting}
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {content.length} characters
                </div>
              </div>

              {/* Voice to Text */}
              <VoiceToText onTextReceived={handleVoiceText} />
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <PenTool className="h-3 w-3" />
                  <span>Your thoughts are private and secure</span>
                </div>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting}
                  className="bg-gradient-hero hover:shadow-glow transition-all duration-300 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Save Memory
                    </>
                  )}
                </Button>
              </div>

              {/* AI Feedback */}
              {aiFeedback && (
                <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">AI Wellness Insights</span>
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  </div>
                  <p className="text-sm text-foreground">
                    {aiFeedback}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts">
          <JournalPrompts onPromptSelect={handlePromptSelect} />
        </TabsContent>

        <TabsContent value="goals">
          <WellnessGoals />
        </TabsContent>
      </Tabs>
    </div>
  );
}