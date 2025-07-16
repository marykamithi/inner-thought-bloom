import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Smile, Meh, Frown, BookOpen } from "lucide-react";

interface MemoryEntry {
  id: string;
  content: string;
  timestamp: Date;
  mood?: 'positive' | 'neutral' | 'negative';
  aiSentiment?: string;
}

// Sample data for demonstration
const sampleEntries: MemoryEntry[] = [
  {
    id: '1',
    content: "Had a wonderful walk in the park today. The sun was shining and I felt really peaceful watching the birds. Sometimes the simple moments are the best ones.",
    timestamp: new Date('2024-07-16T14:30:00'),
    mood: 'positive',
    aiSentiment: "You sound joyful today! Nature seems to bring you peace."
  },
  {
    id: '2',
    content: "Work was challenging today, but I managed to finish that project I've been working on for weeks. Feeling accomplished but also a bit tired.",
    timestamp: new Date('2024-07-15T18:45:00'),
    mood: 'neutral',
    aiSentiment: "It sounds like you're feeling productive despite some stress."
  },
  {
    id: '3',
    content: "Missing my family today. It's been too long since we've all been together. Looking forward to the holidays when we can all meet again.",
    timestamp: new Date('2024-07-14T21:15:00'),
    mood: 'neutral',
    aiSentiment: "It's natural to miss loved ones. Your anticipation shows love."
  }
];

const getMoodIcon = (mood?: string) => {
  switch (mood) {
    case 'positive':
      return <Smile className="h-4 w-4 text-green-500" />;
    case 'negative':
      return <Frown className="h-4 w-4 text-red-500" />;
    default:
      return <Meh className="h-4 w-4 text-yellow-500" />;
  }
};

const getMoodColor = (mood?: string) => {
  switch (mood) {
    case 'positive':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'negative':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  }
};

export function MemoryTimeline() {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-card bg-gradient-card border-0">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
            Your Memory Timeline
          </CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">
          Reflecting on your thoughts and feelings over time
        </p>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {sampleEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="relative pl-8 pb-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Timeline line */}
                {index < sampleEntries.length - 1 && (
                  <div className="absolute left-3 top-8 w-0.5 h-full bg-gradient-to-b from-accent to-accent/20"></div>
                )}
                
                {/* Timeline dot */}
                <div className="absolute left-1 top-2 w-4 h-4 bg-gradient-hero rounded-full border-2 border-background shadow-gentle"></div>
                
                <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-accent/30 shadow-gentle hover:shadow-card transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(entry.timestamp)}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{formatTime(entry.timestamp)}</span>
                    </div>
                    
                    {entry.mood && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getMoodColor(entry.mood)}`}>
                        {getMoodIcon(entry.mood)}
                        <span className="capitalize">{entry.mood}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <p className="text-foreground leading-relaxed mb-3">
                    {entry.content}
                  </p>
                  
                  {/* AI Sentiment */}
                  {entry.aiSentiment && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-primary">AI Wellness Insight</span>
                      </div>
                      <p className="text-sm text-primary/80 italic">
                        "{entry.aiSentiment}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {sampleEntries.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No memories yet. Start writing your first entry!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}