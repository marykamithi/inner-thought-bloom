import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Play, Pause, Square, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceToTextProps {
  onTextReceived: (text: string) => void;
  initialText?: string;
}

export function VoiceToText({ onTextReceived, initialText = "" }: VoiceToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(initialText);
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak now. Your words will appear as you talk.",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => {
            const newTranscript = prev + finalTranscript + " ";
            onTextReceived(newTranscript);
            return newTranscript;
          });
        }
        
        setInterimTranscript(interim);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = "Speech recognition error occurred.";
        switch (event.error) {
          case 'no-speech':
            errorMessage = "No speech was detected. Please try speaking closer to your microphone.";
            break;
          case 'audio-capture':
            errorMessage = "Microphone access was denied or not available.";
            break;
          case 'not-allowed':
            errorMessage = "Speech recognition permission was denied.";
            break;
          case 'network':
            errorMessage = "Network error occurred. Please check your internet connection.";
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        toast({
          title: "Speech Recognition Error",
          description: errorMessage,
          variant: "destructive",
        });
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Remove dependencies to prevent recreation

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Error",
          description: "Could not start speech recognition. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setInterimTranscript("");
        toast({
          title: "Recording stopped",
          description: "Voice recording has been stopped.",
        });
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setIsListening(false);
        setInterimTranscript("");
      }
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
    onTextReceived("");
  };

  const handleTextChange = (value: string) => {
    setTranscript(value);
    onTextReceived(value);
  };

  // Text-to-speech for playback
  const speakText = () => {
    if ('speechSynthesis' in window && transcript) {
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        toast({
          title: "Playing back...",
          description: "Reading your journal entry aloud.",
        });
      };
      
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Text-to-speech not available",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive",
      });
    }
  };

  if (!isSupported) {
    return (
      <Card className="shadow-card bg-gradient-card border-0">
        <CardContent className="p-4 text-center">
          <MicOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-2">Voice Input Not Available</h3>
          <p className="text-sm text-muted-foreground">
            Speech recognition is not supported in your browser. Please use a modern browser like Chrome, Edge, or Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card bg-gradient-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Voice-to-Text Journal
          </CardTitle>
          <div className="flex items-center gap-2">
            {isListening && (
              <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Recording
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Speak naturally and your words will be converted to text automatically
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gradient-hero'
            } transition-all duration-200`}
          >
            {isListening ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={speakText}
            disabled={!transcript}
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Play Back
          </Button>
          
          <Button
            variant="outline"
            onClick={clearTranscript}
            disabled={!transcript && !interimTranscript}
          >
            Clear
          </Button>
        </div>

        <div className="relative">
          <Textarea
            placeholder="Start recording to see your speech converted to text, or type directly..."
            value={transcript + interimTranscript}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[200px] resize-none border-2 border-accent/30 focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-all duration-300"
          />
          
          {isListening && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-2 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Listening...
              </div>
            </div>
          )}
          
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {(transcript + interimTranscript).length} characters
          </div>
        </div>

        {interimTranscript && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-primary font-medium mb-1">Processing speech...</p>
            <p className="text-sm text-muted-foreground italic">"{interimTranscript}"</p>
          </div>
        )}

        <div className="bg-accent/20 rounded-lg p-3 border border-accent/30">
          <h4 className="text-sm font-medium text-foreground mb-2">Voice Recording Tips:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Ensure you're in a quiet environment</li>
            <li>• Allow microphone access when prompted</li>
            <li>• Pause briefly between sentences for better accuracy</li>
            <li>• You can edit the text after recording</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
