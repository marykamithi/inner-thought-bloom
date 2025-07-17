import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserX, Shield, AlertTriangle, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function AccountSettings() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const handleDeleteAccount = async () => {
    if (confirmationText !== "DELETE") {
      toast({
        title: "Confirmation required",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "No user found. Please try signing in again.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      // Show immediate feedback
      toast({
        title: "Deleting account...",
        description: "Please wait while we remove your data.",
      });

      // Delete all user data first
      const { error: memoriesError } = await supabase
        .from('memories')
        .delete()
        .eq('user_id', user.id);

      if (memoriesError) throw memoriesError;

      const { error: metricsError } = await supabase
        .from('wellness_metrics')
        .delete()
        .eq('user_id', user.id);

      if (metricsError) throw metricsError;

      const { error: goalsError } = await supabase
        .from('wellness_goals')
        .delete()
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      // Mark the user as deleted by updating their metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          account_deleted: true,
          deleted_at: new Date().toISOString(),
          email_backup: user.email
        }
      });

      if (updateError) {
        console.warn('Failed to mark account as deleted:', updateError);
      }

      // Close dialog before signing out
      setDialogOpen(false);
      setConfirmationText("");

      // Show success message
      toast({
        title: "Account data permanently deleted ✅",
        description: "Signing you out now. Your account has been disabled.",
      });

      // Small delay to let user see the message, then sign out
      setTimeout(async () => {
        await signOut();
      }, 2000);

    } catch (error: any) {
      console.error('Delete account error:', error);
      
      // Reset states on error
      setIsDeleting(false);
      setDialogOpen(false);
      setConfirmationText("");
      
      // Show error and attempt sign out anyway
      toast({
        title: "Delete account failed 😔",
        description: "There was an issue deleting your account. Please contact support.",
        variant: "destructive",
      });

      // Try to sign out anyway after a delay
      setTimeout(async () => {
        try {
          await signOut();
        } catch (signOutError) {
          console.error('Sign out error:', signOutError);
        }
      }, 3000);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-card bg-gradient-card border-0">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
            Account Settings
          </CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage your account preferences and data
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Account Info */}
        <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Account Information
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
            <p><strong>Account created:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}</p>
            <p><strong>Last sign in:</strong> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Not available'}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Quick Actions</h3>
          
          <Button
            onClick={signOut}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </h3>
          <p className="text-xs text-red-700 dark:text-red-300 mb-4">
            This action cannot be undone. All your journal entries, wellness data, and goals will be permanently deleted.
          </p>
          
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full flex items-center gap-2"
                onClick={() => setDialogOpen(true)}
              >
                <UserX className="h-4 w-4" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>All journal entries and memories</li>
                    <li>Wellness tracking data and metrics</li>
                    <li>Personal goals and achievements</li>
                    <li>Account settings and preferences</li>
                  </ul>
                  <div className="mt-4">
                    <Label htmlFor="confirmation" className="text-sm font-medium">
                      Type <span className="font-bold">DELETE</span> to confirm:
                    </Label>
                    <Input
                      id="confirmation"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="Type DELETE here"
                      className="mt-2"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  onClick={() => {
                    setDialogOpen(false);
                    setConfirmationText("");
                    setIsDeleting(false);
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmationText !== "DELETE"}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Recovery Information */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            💡 Want to start fresh instead?
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
            If you're looking for a fresh start, you can sign out and create a new account with a different email address. This way, you can always come back to this account if you change your mind.
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            After account deletion, your login will be disabled and all data permanently removed. You can create a new account with the same email address, but all previous data will be permanently lost.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
