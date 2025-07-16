import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Heart, Sunrise, Moon, Star, Leaf } from "lucide-react";

interface JournalPrompt {
  id: string;
  category: string;
  prompt: string;
  icon: any;
  description: string;
}

const prompts: JournalPrompt[] = [
  {
    id: "gratitude",
    category: "Gratitude",
    prompt: "What are three things you're grateful for today, and why do they matter to you?",
    icon: Heart,
    description: "Focus on appreciation and positive mindset"
  },
  {
    id: "reflection",
    category: "Self-Reflection",
    prompt: "What emotion did you feel most strongly today? What triggered it, and how did you handle it?",
    icon: Star,
    description: "Explore your emotional landscape"
  },
  {
    id: "growth",
    category: "Personal Growth",
    prompt: "What's one small step you took today toward becoming the person you want to be?",
    icon: Leaf,
    description: "Track your personal development"
  },
  {
    id: "mindfulness",
    category: "Mindfulness",
    prompt: "Describe a moment today when you felt completely present. What were you doing, seeing, or feeling?",
    icon: Sunrise,
    description: "Cultivate awareness and presence"
  },
  {
    id: "relationships",
    category: "Relationships",
    prompt: "How did you connect with someone today? What did you learn about them or yourself?",
    icon: Heart,
    description: "Strengthen your connections"
  },
  {
    id: "challenges",
    category: "Challenges",
    prompt: "What challenge did you face today, and what strength did you discover in yourself while dealing with it?",
    icon: Star,
    description: "Build resilience and self-awareness"
  },
  {
    id: "dreams",
    category: "Dreams & Goals",
    prompt: "What dream or goal felt a little closer today? What specific action brought you closer to it?",
    icon: Moon,
    description: "Manifest your aspirations"
  },
  {
    id: "self-care",
    category: "Self-Care",
    prompt: "How did you take care of yourself today? What does your body, mind, or soul need right now?",
    icon: Leaf,
    description: "Prioritize your wellbeing"
  }
];

interface JournalPromptsProps {
  onPromptSelect: (prompt: string) => void;
}

export function JournalPrompts({ onPromptSelect }: JournalPromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  const categories = [...new Set(prompts.map(p => p.category))];
  const filteredPrompts = selectedCategory 
    ? prompts.filter(p => p.category === selectedCategory)
    : prompts;

  const handlePromptSelect = (prompt: string) => {
    onPromptSelect(prompt);
    setExpandedPrompt(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-card bg-gradient-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Journal Prompts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get inspired with thoughtful prompts to guide your journaling
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="text-xs"
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Prompts */}
        <div className="space-y-3">
          {filteredPrompts.map((prompt) => {
            const Icon = prompt.icon;
            const isExpanded = expandedPrompt === prompt.id;
            
            return (
              <div
                key={prompt.id}
                className="border border-accent/30 rounded-lg p-4 hover:border-primary/50 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {prompt.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {prompt.description}
                    </p>
                    
                    {isExpanded && (
                      <div className="space-y-3">
                        <p className="text-foreground font-medium leading-relaxed">
                          "{prompt.prompt}"
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handlePromptSelect(prompt.prompt)}
                            className="bg-gradient-hero text-sm"
                            size="sm"
                          >
                            Use This Prompt
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setExpandedPrompt(null)}
                            size="sm"
                            className="text-sm"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {!isExpanded && (
                      <Button
                        variant="ghost"
                        onClick={() => setExpandedPrompt(prompt.id)}
                        className="text-sm h-auto p-0 text-primary hover:text-primary/80"
                      >
                        Read full prompt →
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
