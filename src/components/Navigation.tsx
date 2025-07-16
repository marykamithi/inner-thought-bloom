import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, PenTool, BarChart3, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'write', label: 'Write Memory', icon: PenTool },
    { id: 'timeline', label: 'Timeline', icon: Heart },
    { id: 'stats', label: 'Wellness Stats', icon: BarChart3 },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-center bg-background/80 backdrop-blur-sm border-b border-accent/30 sticky top-0 z-50 shadow-gentle">
        <div className="flex items-center space-x-1 p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 transition-all duration-300",
                  activeTab === tab.id 
                    ? "bg-gradient-hero shadow-glow text-white" 
                    : "hover:bg-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-background/80 backdrop-blur-sm border-b border-accent/30 sticky top-0 z-50 shadow-gentle">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold bg-gradient-hero bg-clip-text text-transparent">
              Memory Journal
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-accent/30 bg-background/95 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 h-auto py-3 transition-all duration-300",
                      activeTab === tab.id 
                        ? "bg-gradient-hero shadow-glow text-white" 
                        : "hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}