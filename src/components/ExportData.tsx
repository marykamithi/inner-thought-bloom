import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Table, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Memory {
  id: string;
  content: string;
  created_at: string;
  sentiment_label: string | null;
  ai_feedback: string | null;
  sentiment_score: number | null;
  updated_at: string;
  user_id: string;
}

export function ExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "json">("pdf");
  const [dateRange, setDateRange] = useState<"all" | "week" | "month" | "year">("all");
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMemoriesForExport = async () => {
    if (!user) return [];

    let query = supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply date filtering
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const fetchWellnessDataForExport = async () => {
    if (!user) return { metrics: [], goals: [] };

    let metricsQuery = supabase
      .from('wellness_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    let goalsQuery = supabase
      .from('wellness_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply date filtering
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      metricsQuery = metricsQuery.gte('date', startDate.toISOString().split('T')[0]);
      goalsQuery = goalsQuery.gte('created_at', startDate.toISOString());
    }

    const [metricsResult, goalsResult] = await Promise.all([
      metricsQuery,
      goalsQuery
    ]);

    if (metricsResult.error) throw metricsResult.error;
    if (goalsResult.error) throw goalsResult.error;

    return {
      metrics: metricsResult.data || [],
      goals: goalsResult.data || []
    };
  };

  const exportToPDF = async (memories: Memory[], wellnessData: any) => {
    // Create a simple HTML content for PDF conversion
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inner Thought Bloom - My Wellness Journey</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #8b5cf6; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .section { margin-bottom: 40px; }
          .section h2 { color: #8b5cf6; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; }
          .memory { margin-bottom: 30px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa; }
          .memory-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .memory-date { color: #666; font-size: 14px; }
          .mood-badge { background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: capitalize; }
          .memory-content { margin-bottom: 15px; line-height: 1.8; }
          .ai-feedback { background: #f0f7ff; border-left: 4px solid #8b5cf6; padding: 15px; margin-top: 15px; border-radius: 4px; }
          .ai-feedback h4 { margin: 0 0 10px 0; color: #8b5cf6; }
          .wellness-metric { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 15px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; }
          .metric-item { text-align: center; }
          .metric-value { font-weight: bold; color: #8b5cf6; }
          .stats { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 30px; }
          .stats h3 { margin-top: 0; color: #8b5cf6; }
          .goal { padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 15px; }
          .goal.completed { background: #f0f9ff; border-color: #22c55e; }
          .goal.pending { background: #fff7ed; border-color: #f59e0b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌸 Inner Thought Bloom</h1>
          <p>My Personal Wellness Journey Archive</p>
          <p>A beautiful collection of my growth, reflections, and milestones</p>
          <p>Created with love on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h2>📊 Export Summary</h2>
          <ul>
            <li><strong>Journal Entries:</strong> ${memories.length}</li>
            <li><strong>Wellness Metrics:</strong> ${wellnessData.metrics.length} days tracked</li>
            <li><strong>Wellness Goals:</strong> ${wellnessData.goals.length} goals set</li>
            <li><strong>Period:</strong> ${dateRange === 'all' ? 'All time' : `Last ${dateRange}`}</li>
          </ul>
        </div>

        ${wellnessData.metrics.length > 0 ? `
        <div class="section">
          <h2>💪 Wellness Metrics</h2>
          ${wellnessData.metrics.map(metric => `
            <div class="wellness-metric">
              <div class="metric-item">
                <div>Sleep</div>
                <div class="metric-value">${metric.sleep_hours || 0}h</div>
              </div>
              <div class="metric-item">
                <div>Exercise</div>
                <div class="metric-value">${metric.exercise_minutes || 0}min</div>
              </div>
              <div class="metric-item">
                <div>Water</div>
                <div class="metric-value">${metric.water_glasses || 0} glasses</div>
              </div>
              <div class="metric-item">
                <div>Energy</div>
                <div class="metric-value">${metric.energy_level || 0}/10</div>
              </div>
              <div class="metric-item">
                <div>Stress</div>
                <div class="metric-value">${metric.stress_level || 0}/10</div>
              </div>
            </div>
            <p style="text-align: center; margin-top: -10px; color: #666; font-size: 14px;">${new Date(metric.date).toLocaleDateString()}</p>
          `).join('')}
        </div>
        ` : ''}

        ${wellnessData.goals.length > 0 ? `
        <div class="section">
          <h2>🎯 Wellness Goals</h2>
          ${wellnessData.goals.map(goal => `
            <div class="goal ${goal.completed ? 'completed' : 'pending'}">
              <h4>${goal.title} ${goal.completed ? '✅' : '⏳'}</h4>
              ${goal.description ? `<p>${goal.description}</p>` : ''}
              <p><small>Created: ${new Date(goal.created_at).toLocaleDateString()}</small></p>
              ${goal.target_date ? `<p><small>Target: ${new Date(goal.target_date).toLocaleDateString()}</small></p>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <div class="section">
          <h2>📝 Journal Entries</h2>
          ${memories.map(memory => `
            <div class="memory">
              <div class="memory-header">
                <span class="memory-date">${new Date(memory.created_at).toLocaleDateString()} at ${new Date(memory.created_at).toLocaleTimeString()}</span>
                ${memory.sentiment_label ? `<span class="mood-badge">${memory.sentiment_label}</span>` : ''}
              </div>
              <div class="memory-content">${memory.content.replace(/\n/g, '<br>')}</div>
              ${memory.ai_feedback ? `
                <div class="ai-feedback">
                  <h4>💡 AI Wellness Insight</h4>
                  <p>${memory.ai_feedback}</p>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div class="stats">
          <h3>📊 Complete Statistics</h3>
          <p><strong>Journal Mood Distribution:</strong></p>
          <ul>
            <li>Positive: ${memories.filter(m => m.sentiment_label === 'positive').length} entries</li>
            <li>Neutral: ${memories.filter(m => m.sentiment_label === 'neutral').length} entries</li>
            <li>Negative: ${memories.filter(m => m.sentiment_label === 'negative').length} entries</li>
          </ul>
          ${wellnessData.metrics.length > 0 ? `
          <p><strong>Wellness Averages:</strong></p>
          <ul>
            <li>Average Sleep: ${(wellnessData.metrics.reduce((sum, m) => sum + (m.sleep_hours || 0), 0) / wellnessData.metrics.length).toFixed(1)} hours</li>
            <li>Average Exercise: ${(wellnessData.metrics.reduce((sum, m) => sum + (m.exercise_minutes || 0), 0) / wellnessData.metrics.length).toFixed(0)} minutes</li>
            <li>Average Water: ${(wellnessData.metrics.reduce((sum, m) => sum + (m.water_glasses || 0), 0) / wellnessData.metrics.length).toFixed(1)} glasses</li>
            <li>Average Energy: ${(wellnessData.metrics.reduce((sum, m) => sum + (m.energy_level || 0), 0) / wellnessData.metrics.length).toFixed(1)}/10</li>
            <li>Average Stress: ${(wellnessData.metrics.reduce((sum, m) => sum + (m.stress_level || 0), 0) / wellnessData.metrics.length).toFixed(1)}/10</li>
          </ul>
          ` : ''}
          <p><strong>Goals Progress:</strong> ${wellnessData.goals.filter(g => g.completed).length}/${wellnessData.goals.length} completed</p>
        </div>
      </body>
      </html>
    `;

    // Create and download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inner-thought-bloom-complete-export-${dateRange}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = async (memories: Memory[], wellnessData: any) => {
    // Create separate CSV sections for different data types
    let csvContent = '';
    
    // Journal Entries Section
    csvContent += 'JOURNAL ENTRIES\n';
    const journalHeaders = ['Date', 'Time', 'Content', 'Mood', 'Score', 'AI Feedback'];
    csvContent += journalHeaders.join(',') + '\n';
    csvContent += memories.map(memory => [
      `"${new Date(memory.created_at).toLocaleDateString()}"`,
      `"${new Date(memory.created_at).toLocaleTimeString()}"`,
      `"${memory.content.replace(/"/g, '""')}"`,
      `"${memory.sentiment_label || 'N/A'}"`,
      `"${memory.sentiment_score || 'N/A'}"`,
      `"${memory.ai_feedback?.replace(/"/g, '""') || 'N/A'}"`
    ].join(',')).join('\n');

    // Wellness Metrics Section
    if (wellnessData.metrics.length > 0) {
      csvContent += '\n\nWELLNESS METRICS\n';
      const metricsHeaders = ['Date', 'Sleep Hours', 'Exercise Minutes', 'Water Glasses', 'Energy Level', 'Stress Level'];
      csvContent += metricsHeaders.join(',') + '\n';
      csvContent += wellnessData.metrics.map(metric => [
        `"${new Date(metric.date).toLocaleDateString()}"`,
        `"${metric.sleep_hours || 0}"`,
        `"${metric.exercise_minutes || 0}"`,
        `"${metric.water_glasses || 0}"`,
        `"${metric.energy_level || 0}"`,
        `"${metric.stress_level || 0}"`
      ].join(',')).join('\n');
    }

    // Wellness Goals Section
    if (wellnessData.goals.length > 0) {
      csvContent += '\n\nWELLNESS GOALS\n';
      const goalsHeaders = ['Title', 'Description', 'Created Date', 'Target Date', 'Completed'];
      csvContent += goalsHeaders.join(',') + '\n';
      csvContent += wellnessData.goals.map(goal => [
        `"${goal.title?.replace(/"/g, '""') || 'N/A'}"`,
        `"${goal.description?.replace(/"/g, '""') || 'N/A'}"`,
        `"${new Date(goal.created_at).toLocaleDateString()}"`,
        `"${goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'N/A'}"`,
        `"${goal.completed ? 'Yes' : 'No'}"`
      ].join(',')).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inner-thought-bloom-complete-export-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = async (memories: Memory[], wellnessData: any) => {
    const exportData = {
      exportInfo: {
        platform: "Inner Thought Bloom",
        exportDate: new Date().toISOString(),
        dateRange: dateRange,
        totalEntries: memories.length,
        totalWellnessMetrics: wellnessData.metrics.length,
        totalWellnessGoals: wellnessData.goals.length
      },
      journalEntries: memories.map(memory => ({
        id: memory.id,
        content: memory.content,
        createdAt: memory.created_at,
        mood: memory.sentiment_label,
        sentimentScore: memory.sentiment_score,
        aiInsight: memory.ai_feedback
      })),
      wellnessMetrics: wellnessData.metrics.map(metric => ({
        date: metric.date,
        sleepHours: metric.sleep_hours || 0,
        exerciseMinutes: metric.exercise_minutes || 0,
        waterGlasses: metric.water_glasses || 0,
        energyLevel: metric.energy_level || 0,
        stressLevel: metric.stress_level || 0
      })),
      wellnessGoals: wellnessData.goals.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        createdAt: goal.created_at,
        targetDate: goal.target_date,
        completed: goal.completed
      })),
      statistics: {
        journal: {
          moodDistribution: {
            positive: memories.filter(m => m.sentiment_label === 'positive').length,
            neutral: memories.filter(m => m.sentiment_label === 'neutral').length,
            negative: memories.filter(m => m.sentiment_label === 'negative').length
          }
        },
        wellness: wellnessData.metrics.length > 0 ? {
          averages: {
            sleepHours: (wellnessData.metrics.reduce((sum, m) => sum + (m.sleep_hours || 0), 0) / wellnessData.metrics.length).toFixed(1),
            exerciseMinutes: (wellnessData.metrics.reduce((sum, m) => sum + (m.exercise_minutes || 0), 0) / wellnessData.metrics.length).toFixed(0),
            waterGlasses: (wellnessData.metrics.reduce((sum, m) => sum + (m.water_glasses || 0), 0) / wellnessData.metrics.length).toFixed(1),
            energyLevel: (wellnessData.metrics.reduce((sum, m) => sum + (m.energy_level || 0), 0) / wellnessData.metrics.length).toFixed(1),
            stressLevel: (wellnessData.metrics.reduce((sum, m) => sum + (m.stress_level || 0), 0) / wellnessData.metrics.length).toFixed(1)
          }
        } : null,
        goals: {
          total: wellnessData.goals.length,
          completed: wellnessData.goals.filter(g => g.completed).length,
          completionRate: wellnessData.goals.length > 0 ? 
            ((wellnessData.goals.filter(g => g.completed).length / wellnessData.goals.length) * 100).toFixed(1) + '%' : '0%'
        }
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inner-thought-bloom-complete-export-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!user) {
      toast({
        title: "Welcome back! 👋",
        description: "Please sign in to access and export your wellness journey.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const [memories, wellnessData] = await Promise.all([
        fetchMemoriesForExport(),
        fetchWellnessDataForExport()
      ]);

      const totalItems = memories.length + wellnessData.metrics.length + wellnessData.goals.length;

      if (totalItems === 0) {
        toast({
          title: "Your journey awaits! 🌱",
          description: `No memories found for ${dateRange === 'all' ? 'your account yet' : `the ${dateRange} period`}. Start writing to create your first export!`,
          variant: "destructive",
        });
        setIsExporting(false);
        return;
      }

      switch (exportFormat) {
        case 'pdf':
          await exportToPDF(memories, wellnessData);
          break;
        case 'csv':
          await exportToCSV(memories, wellnessData);
          break;
        case 'json':
          await exportToJSON(memories, wellnessData);
          break;
      }

      toast({
        title: "Your wellness story is ready! 🎉",
        description: `Successfully exported ${memories.length} journal entries, ${wellnessData.metrics.length} wellness metrics, and ${wellnessData.goals.length} goals as a beautiful ${exportFormat.toUpperCase()} file.`,
      });

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Oops! Something went wrong 😔",
        description: error.message || "We encountered an issue while preparing your export. Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-card bg-gradient-card border-0">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Download className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
            Preserve Your Wellness Journey
          </CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">
          Create a beautiful archive of your thoughts, growth, and wellness milestones to treasure forever
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Export Format Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Choose Your Story Format</label>
          <Select value={exportFormat} onValueChange={(value: "pdf" | "csv" | "json") => setExportFormat(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="How would you like to preserve your journey?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>PDF/HTML - A beautiful story of your wellness journey</span>
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  <span>CSV - Data for analysis and insights</span>
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>JSON - Complete digital archive with all details</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Select Your Chapter</label>
          <Select value={dateRange} onValueChange={(value: "all" | "week" | "month" | "year") => setDateRange(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Which part of your story resonates most?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Complete Journey - Every moment captured</span>
                </div>
              </SelectItem>
              <SelectItem value="week">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Recent Reflections - Last 7 days</span>
                </div>
              </SelectItem>
              <SelectItem value="month">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Monthly Milestones - Last 30 days</span>
                </div>
              </SelectItem>
              <SelectItem value="year">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Annual Adventures - Past year</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Format Description */}
        <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
          <h4 className="text-sm font-medium text-foreground mb-2">✨ What You'll Receive:</h4>
          {exportFormat === 'pdf' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 📖 A beautifully formatted digital book of your wellness journey</p>
              <p>• 🎨 Includes all your thoughts, moods, insights, and wellness metrics</p>
              <p>• 🖨️ Print-ready format perfect for keepsakes or sharing with loved ones</p>
              <p>• 📊 Complete statistics and progress summaries</p>
            </div>
          )}
          {exportFormat === 'csv' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 📈 Structured data perfect for creating your own visualizations</p>
              <p>• 💻 Opens seamlessly in Excel, Google Sheets, or any spreadsheet app</p>
              <p>• 🔍 Ideal for tracking patterns and analyzing your wellness trends</p>
              <p>• 📋 Clean, organized columns for easy data manipulation</p>
            </div>
          )}
          {exportFormat === 'json' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 🔧 Complete digital archive with every detail preserved</p>
              <p>• 💾 Developer-friendly format for technical users</p>
              <p>• 🔄 Can be imported into other wellness or journaling apps</p>
              <p>• 🎯 Includes metadata, timestamps, and relationship data</p>
            </div>
          )}
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport}
          disabled={isExporting}
          className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 transform hover:scale-105"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Crafting your beautiful export...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Create My {exportFormat.toUpperCase()} Story ✨
            </>
          )}
        </Button>

        {/* Privacy Note */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-xs font-medium text-primary">🔒 Your Privacy Matters</span>
          </div>
          <p className="text-xs text-primary/80">
            Your precious memories stay completely private. Everything is processed locally on your device - no data ever leaves your computer during export.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
