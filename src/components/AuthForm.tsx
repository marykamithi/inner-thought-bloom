import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Sparkles, Brain } from "lucide-react";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const { toast } = useToast();

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Disable email confirmation for immediate access
        emailRedirectTo: undefined,
        data: {
          email_confirm: false
        }
      }
    });

    setIsLoading(false);

    if (error) {
      // Check if user already exists with various possible error messages
      if (error.message.includes("already registered") || 
          error.message.includes("already been registered") ||
          error.message.includes("User already registered") ||
          error.message.includes("already signed up") ||
          error.message.includes("email address is already in use") ||
          error.message.includes("Email rate limit exceeded") ||
          error.message.includes("already exists") ||
          error.message.includes("duplicate") ||
          error.message.toLowerCase().includes("user with this email already exists")) {
        toast({
          title: "Account exists! 👋",
          description: "This email is already registered. Please use the Sign In tab to access your account.",
        });
        // Switch to sign-in tab and keep the email filled
        setActiveTab("signin");
        setPassword(""); // Clear password for security
        
        // Add a small delay and show another helpful message
        setTimeout(() => {
          toast({
            title: "Ready to sign in! 🔑",
            description: "Please enter your password to access your wellness journal.",
          });
        }, 1500);
        return;
      }
      
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (data?.user) {
      // User successfully created - they can start using the app immediately
      toast({
        title: "Welcome to Inner Thought Bloom! 🎉",
        description: "Your account has been created successfully. Start journaling your thoughts and memories right away!",
      });
      
      // Clear the form
      setEmail("");
      setPassword("");
    } else {
      // Fallback success message
      toast({
        title: "Account created! ✅",
        description: "You can now start using your wellness journal immediately.",
      });
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back! 💖",
        description: "You're now signed in to your memory journal.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card bg-gradient-card border-0">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-primary animate-float" />
            <CardTitle className="text-3xl bg-gradient-hero bg-clip-text text-transparent">
              Memory Journal
            </CardTitle>
            <Sparkles className="h-8 w-8 text-primary-glow animate-float" style={{ animationDelay: '1s' }} />
          </div>
          <p className="text-muted-foreground flex items-center justify-center gap-1">
            <Heart className="h-4 w-4 text-primary" />
            Your safe space for thoughts and wellness
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Development Notice */}
          {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Development Mode:</strong> If email confirmation links don't work from your email client, 
                you can often sign in directly after creating an account, or restart the dev server and try the link again.
              </p>
            </div>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email to continue your wellness journey..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Your secure password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  ✨ <strong>Start journaling immediately!</strong> No email confirmation needed - you can begin using your wellness journal right after creating your account.
                </p>
              </div>
              
              <Button 
                onClick={handleSignUp}
                disabled={isLoading}
                className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300"
              >
                {isLoading ? "Creating account..." : "Create Account & Start Journaling"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}