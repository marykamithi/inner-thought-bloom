import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, PenTool, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const { toast } = useToast();
  const { user } = useAuth();

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
          sentiment_label: analysisData?.sentiment_label || null,
          ai_feedback: analysisData?.feedback || null,
        });

      if (dbError) {
        throw dbError;
      }

      setAiFeedback(analysisData?.feedback || null);
      setContent("");
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
    <Card className="w-full max-w-2xl mx-auto shadow-card bg-gradient-card border-0 overflow-hidden">
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
  );
}