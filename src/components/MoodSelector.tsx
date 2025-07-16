import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, Frown, Heart, Star, Zap } from "lucide-react";

interface MoodSelectorProps {
  onMoodSelect: (mood: string, intensity: number) => void;
  selectedMood?: string;
  selectedIntensity?: number;
}

const moods = [
  { name: 'joyful', icon: Star, color: 'bg-yellow-500', label: 'Joyful' },
  { name: 'positive', icon: Smile, color: 'bg-green-500', label: 'Positive' },
  { name: 'neutral', icon: Meh, color: 'bg-blue-500', label: 'Neutral' },
  { name: 'negative', icon: Frown, color: 'bg-red-500', label: 'Negative' },
  { name: 'anxious', icon: Zap, color: 'bg-orange-500', label: 'Anxious' },
  { name: 'grateful', icon: Heart, color: 'bg-pink-500', label: 'Grateful' },
];

export function MoodSelector({ onMoodSelect, selectedMood, selectedIntensity }: MoodSelectorProps) {
  const [mood, setMood] = useState(selectedMood || '');
  const [intensity, setIntensity] = useState(selectedIntensity || 3);

  const handleMoodChange = (newMood: string) => {
    setMood(newMood);
    onMoodSelect(newMood, intensity);
  };

  const handleIntensityChange = (newIntensity: number) => {
    setIntensity(newIntensity);
    if (mood) {
      onMoodSelect(mood, newIntensity);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3">How are you feeling?</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {moods.map((moodOption) => {
              const Icon = moodOption.icon;
              const isSelected = mood === moodOption.name;
              
              return (
                <button
                  key={moodOption.name}
                  onClick={() => handleMoodChange(moodOption.name)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                    isSelected 
                      ? 'border-primary bg-primary/10 scale-105' 
                      : 'border-accent/30 hover:border-primary/50 hover:bg-accent/20'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs ${isSelected ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {moodOption.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {mood && (
          <div>
            <h3 className="text-sm font-medium mb-3">Intensity (1-5)</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleIntensityChange(level)}
                  className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                    intensity >= level
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-accent/30 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
