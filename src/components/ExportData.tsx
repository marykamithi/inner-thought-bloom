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
  mood_intensity: number | null;
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

  const exportToPDF = async (memories: Memory[]) => {
    // Create a simple HTML content for PDF conversion
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inner Thought Bloom - Journal Export</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #8b5cf6; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .memory { margin-bottom: 30px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa; }
          .memory-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .memory-date { color: #666; font-size: 14px; }
          .mood-badge { background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: capitalize; }
          .memory-content { margin-bottom: 15px; line-height: 1.8; }
          .ai-feedback { background: #f0f7ff; border-left: 4px solid #8b5cf6; padding: 15px; margin-top: 15px; border-radius: 4px; }
          .ai-feedback h4 { margin: 0 0 10px 0; color: #8b5cf6; }
          .stats { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 30px; }
          .stats h3 { margin-top: 0; color: #8b5cf6; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌸 Inner Thought Bloom</h1>
          <p>Personal Wellness Journal Export</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>Total Entries: ${memories.length}</p>
        </div>
        
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
        
        <div class="stats">
          <h3>📊 Export Summary</h3>
          <p><strong>Period:</strong> ${dateRange === 'all' ? 'All time' : `Last ${dateRange}`}</p>
          <p><strong>Total Entries:</strong> ${memories.length}</p>
          <p><strong>Mood Distribution:</strong></p>
          <ul>
            <li>Positive: ${memories.filter(m => m.sentiment_label === 'positive').length} entries</li>
            <li>Neutral: ${memories.filter(m => m.sentiment_label === 'neutral').length} entries</li>
            <li>Negative: ${memories.filter(m => m.sentiment_label === 'negative').length} entries</li>
          </ul>
        </div>
      </body>
      </html>
    `;

    // Create and download the HTML file (which can be saved as PDF by the user)
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inner-thought-bloom-journal-${dateRange}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = async (memories: Memory[]) => {
    const headers = ['Date', 'Time', 'Content', 'Mood', 'Intensity', 'AI Feedback'];
    const csvContent = [
      headers.join(','),
      ...memories.map(memory => [
        `"${new Date(memory.created_at).toLocaleDateString()}"`,
        `"${new Date(memory.created_at).toLocaleTimeString()}"`,
        `"${memory.content.replace(/"/g, '""')}"`,
        `"${memory.sentiment_label || 'N/A'}"`,
        `"${memory.mood_intensity || 'N/A'}"`,
        `"${memory.ai_feedback?.replace(/"/g, '""') || 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inner-thought-bloom-journal-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = async (memories: Memory[]) => {
    const exportData = {
      exportInfo: {
        platform: "Inner Thought Bloom",
        exportDate: new Date().toISOString(),
        dateRange: dateRange,
        totalEntries: memories.length
      },
      memories: memories.map(memory => ({
        id: memory.id,
        content: memory.content,
        createdAt: memory.created_at,
        mood: memory.sentiment_label,
        moodIntensity: memory.mood_intensity,
        aiInsight: memory.ai_feedback
      })),
      statistics: {
        moodDistribution: {
          positive: memories.filter(m => m.sentiment_label === 'positive').length,
          neutral: memories.filter(m => m.sentiment_label === 'neutral').length,
          negative: memories.filter(m => m.sentiment_label === 'negative').length
        }
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inner-thought-bloom-journal-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to export your data.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const memories = await fetchMemoriesForExport();

      if (memories.length === 0) {
        toast({
          title: "No data to export",
          description: `No entries found for the selected time period (${dateRange}).`,
          variant: "destructive",
        });
        setIsExporting(false);
        return;
      }

      switch (exportFormat) {
        case 'pdf':
          await exportToPDF(memories);
          break;
        case 'csv':
          await exportToCSV(memories);
          break;
        case 'json':
          await exportToJSON(memories);
          break;
      }

      toast({
        title: "Export successful! ✨",
        description: `${memories.length} entries exported as ${exportFormat.toUpperCase()}. Check your downloads folder.`,
      });

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error.message || "An error occurred while exporting your data.",
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
            Export Your Journal
          </CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">
          Download your wellness journey data in your preferred format
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Export Format Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Export Format</label>
          <Select value={exportFormat} onValueChange={(value: "pdf" | "csv" | "json") => setExportFormat(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>PDF/HTML - Beautiful formatted journal</span>
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  <span>CSV - Spreadsheet compatible</span>
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>JSON - Complete data with metadata</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Time Period</label>
          <Select value={dateRange} onValueChange={(value: "all" | "week" | "month" | "year") => setDateRange(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>All Time</span>
                </div>
              </SelectItem>
              <SelectItem value="week">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Last 7 Days</span>
                </div>
              </SelectItem>
              <SelectItem value="month">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Last Month</span>
                </div>
              </SelectItem>
              <SelectItem value="year">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Last Year</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Format Description */}
        <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
          <h4 className="text-sm font-medium text-foreground mb-2">Format Details:</h4>
          {exportFormat === 'pdf' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Beautiful HTML format that can be saved as PDF</p>
              <p>• Includes all content, moods, and AI insights</p>
              <p>• Perfect for printing or sharing</p>
            </div>
          )}
          {exportFormat === 'csv' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Compatible with Excel, Google Sheets</p>
              <p>• Structured data in columns</p>
              <p>• Great for data analysis</p>
            </div>
          )}
          {exportFormat === 'json' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Complete data with all metadata</p>
              <p>• Developer-friendly format</p>
              <p>• Can be imported into other apps</p>
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
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export {exportFormat.toUpperCase()}
            </>
          )}
        </Button>

        {/* Privacy Note */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-xs font-medium text-primary">Privacy & Security</span>
          </div>
          <p className="text-xs text-primary/80">
            Your data is exported directly to your device. Nothing is sent to external servers during this process.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
