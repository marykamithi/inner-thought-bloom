import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast({
            title: "Authentication Error",
            description: "There was an error confirming your email. Please try again.",
            variant: "destructive",
          });
          
          // Redirect to auth page after a short delay
          setTimeout(() => {
            navigate("/");
          }, 3000);
          return;
        }

        if (data.session) {
          toast({
            title: "Email Confirmed! ✅",
            description: "Your email has been confirmed successfully. Welcome to Memory Journal!",
          });
          
          // Redirect to the main app
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          // Handle the email confirmation process
          const urlParams = new URLSearchParams(window.location.search);
          const accessToken = urlParams.get("access_token");
          const refreshToken = urlParams.get("refresh_token");
          
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) {
              throw sessionError;
            }
            
            toast({
              title: "Email Confirmed! ✅",
              description: "Your email has been confirmed successfully. Welcome to Memory Journal!",
            });
            
            setTimeout(() => {
              navigate("/");
            }, 2000);
          } else {
            throw new Error("No session tokens found in URL");
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast({
          title: "Authentication Error",
          description: "There was an error confirming your email. Please try signing in manually.",
          variant: "destructive",
        });
        
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card bg-gradient-card border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
            Confirming Email...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">
            Please wait while we confirm your email address.
          </p>
          <div className="text-xs text-muted-foreground">
            You'll be redirected automatically once confirmed.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
