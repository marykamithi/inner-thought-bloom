import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Brain, Clock, Heart, Leaf, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MeditationSession {
  id: string;
  type: string;
  duration: number;
  completed: boolean;
  title: string;
  description: string;
  instructions: string[];
}

const meditationSessions: MeditationSession[] = [
  {
    id: 'breathing',
    type: 'Breathing',
    duration: 300, // 5 minutes
    completed: false,
    title: 'Deep Breathing',
    description: 'Focus on your breath to calm your mind and reduce stress',
    instructions: [
      'Sit comfortably with your back straight',
      'Close your eyes or soften your gaze',
      'Breathe in slowly through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly through your mouth for 6 counts',
      'Repeat this cycle, focusing only on your breath'
    ]
  },
  {
    id: 'mindfulness',
    type: 'Mindfulness',
    duration: 600, // 10 minutes
    completed: false,
    title: 'Mindful Awareness',
    description: 'Develop present-moment awareness and acceptance',
    instructions: [
      'Find a comfortable seated position',
      'Notice your body and how it feels',
      'Bring attention to your breathing',
      'When thoughts arise, acknowledge them without judgment',
      'Gently return your attention to the present moment',
      'Observe your thoughts, feelings, and sensations with curiosity'
    ]
  },
  {
    id: 'loving-kindness',
    type: 'Loving Kindness',
    duration: 900, // 15 minutes
    completed: false,
    title: 'Loving Kindness',
    description: 'Cultivate compassion and kindness towards yourself and others',
    instructions: [
      'Sit comfortably and close your eyes',
      'Begin by directing loving thoughts to yourself',
      'Repeat: "May I be happy, may I be peaceful, may I be free from suffering"',
      'Extend these wishes to someone you love',
      'Then to someone neutral in your life',
      'Finally, send loving kindness to someone difficult',
      'End by extending love to all beings everywhere'
    ]
  },
  {
    id: 'body-scan',
    type: 'Body Scan',
    duration: 1200, // 20 minutes
    completed: false,
    title: 'Progressive Body Scan',
    description: 'Release tension and develop body awareness',
    instructions: [
      'Lie down comfortably on your back',
      'Close your eyes and take a few deep breaths',
      'Start by noticing your toes, then slowly move up',
      'Pay attention to each part of your body',
      'Notice any tension and breathe into those areas',
      'Allow each body part to relax as you scan upward',
      'End by noticing your whole body as one unified sensation'
    ]
  }
];

export function MeditationTimer() {
  const [selectedSession, setSelectedSession] = useState<MeditationSession>(meditationSessions[0]);
  const [timeLeft, setTimeLeft] = useState(selectedSession.duration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            toast({
              title: "Meditation Complete! 🧘‍♀️",
              description: "Congratulations on completing your mindfulness practice.",
            });
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, toast]);

  // Change instruction every 30 seconds during session
  useEffect(() => {
    if (isActive && selectedSession.instructions.length > 1) {
      const instructionInterval = setInterval(() => {
        setCurrentInstructionIndex((index) => 
          (index + 1) % selectedSession.instructions.length
        );
      }, 30000); // 30 seconds

      return () => clearInterval(instructionInterval);
    }
  }, [isActive, selectedSession.instructions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((selectedSession.duration - timeLeft) / selectedSession.duration) * 100;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(selectedSession.duration);
    setIsCompleted(false);
    setCurrentInstructionIndex(0);
  };

  const selectSession = (session: MeditationSession) => {
    setSelectedSession(session);
    setTimeLeft(session.duration);
    setIsActive(false);
    setIsCompleted(false);
    setCurrentInstructionIndex(0);
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'Breathing': return Heart;
      case 'Mindfulness': return Brain;
      case 'Loving Kindness': return Sun;
      case 'Body Scan': return Leaf;
      default: return Brain;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-6 w-6 text-primary animate-float" />
          <h2 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Meditation & Mindfulness
          </h2>
        </div>
        <p className="text-muted-foreground">
          Guided meditation sessions to support your mental wellness
        </p>
      </div>

      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sessions">Choose Session</TabsTrigger>
          <TabsTrigger value="timer">Meditation Timer</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meditationSessions.map((session) => {
              const Icon = getSessionIcon(session.type);
              const isSelected = selectedSession.id === session.id;
              
              return (
                <Card 
                  key={session.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-glow' 
                      : 'shadow-card bg-gradient-card border-0 hover:border-primary/50'
                  }`}
                  onClick={() => selectSession(session)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {session.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.round(session.duration / 60)}min
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">What you'll practice:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {session.instructions.slice(0, 3).map((instruction, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="timer" className="space-y-6">
          <Card className="shadow-card bg-gradient-card border-0">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {(() => {
                  const Icon = getSessionIcon(selectedSession.type);
                  return <Icon className="h-6 w-6 text-primary" />;
                })()}
                <CardTitle className="text-xl">{selectedSession.title}</CardTitle>
              </div>
              <p className="text-muted-foreground">{selectedSession.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="text-center space-y-4">
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-accent/30"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className="text-primary transition-all duration-1000"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - getProgress() / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-foreground">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isCompleted ? 'Complete!' : isActive ? 'Meditating' : 'Ready'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-accent/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-hero h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${getProgress()}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Instruction */}
              {isActive && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-primary font-medium mb-2">Current Focus:</p>
                    <p className="text-foreground">
                      {selectedSession.instructions[currentInstructionIndex]}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={toggleTimer}
                  disabled={isCompleted}
                  className="bg-gradient-hero px-8"
                  size="lg"
                >
                  {isActive ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      {timeLeft === selectedSession.duration ? 'Start' : 'Resume'}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Instructions */}
              {!isActive && (
                <Card className="bg-accent/20 border-accent/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Meditation Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {selectedSession.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
