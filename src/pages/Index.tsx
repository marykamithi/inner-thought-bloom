import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { MemoryEntry } from "@/components/MemoryEntry";
import { MemoryTimeline } from "@/components/MemoryTimeline";
import { WellnessStats } from "@/components/WellnessStats";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Sparkles, Brain } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('write');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'write':
        return <MemoryEntry />;
      case 'timeline':
        return <MemoryTimeline />;
      case 'stats':
        return <WellnessStats />;
      default:
        return <MemoryEntry />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Hero Section - only show on write tab */}
      {activeTab === 'write' && (
        <div className="text-center py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-primary animate-float" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Memory Journal
              </h1>
              <Sparkles className="h-8 w-8 text-primary-glow animate-float" style={{ animationDelay: '1s' }} />
            </div>
            <p className="text-lg text-muted-foreground mb-2">
              Your safe space for thoughts, memories, and mental wellness
            </p>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Heart className="h-4 w-4 text-primary" />
              AI-powered insights to support your mental health journey
            </p>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        {renderContent()}
      </div>
      
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
};

export default Index;
