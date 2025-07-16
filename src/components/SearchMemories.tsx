import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Calendar, 
  Clock, 
  Smile, 
  Frown, 
  Meh, 
  Filter,
  X,
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Memory {
  id: string;
  content: string;
  created_at: string;
  sentiment_label: string | null;
  ai_feedback: string | null;
  mood_intensity: number | null;
}

interface SearchFilters {
  mood: string;
  dateRange: string;
  sortBy: string;
}

export function SearchMemories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    mood: "all",
    dateRange: "all",
    sortBy: "newest"
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, filters, memories]);

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast({
        title: "Error loading memories",
        description: "Failed to load your journal entries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...memories];

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(memory => 
        memory.content.toLowerCase().includes(query) ||
        memory.ai_feedback?.toLowerCase().includes(query) ||
        memory.sentiment_label?.toLowerCase().includes(query)
      );
    }

    // Apply mood filter
    if (filters.mood !== "all") {
      filtered = filtered.filter(memory => memory.sentiment_label === filters.mood);
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(memory => 
        new Date(memory.created_at) >= startDate
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "relevance":
        // If there's a search query, sort by relevance (simple word count match)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered.sort((a, b) => {
            const aMatches = (a.content.toLowerCase().match(new RegExp(query, 'g')) || []).length;
            const bMatches = (b.content.toLowerCase().match(new RegExp(query, 'g')) || []).length;
            return bMatches - aMatches;
          });
        }
        break;
    }

    setFilteredMemories(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      mood: "all",
      dateRange: "all",
      sortBy: "newest"
    });
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-primary/20 text-primary-foreground rounded px-1">
          {part}
        </mark> : part
    );
  };

  const getMoodIcon = (mood: string | null) => {
    switch (mood) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-600" />;
      case 'neutral':
        return <Meh className="h-4 w-4 text-yellow-600" />;
      default:
        return <Meh className="h-4 w-4 text-gray-400" />;
    }
  };

  const getMoodColor = (mood: string | null) => {
    switch (mood) {
      case 'positive':
        return 'border-green-200 bg-green-50 text-green-700';
      case 'negative':
        return 'border-red-200 bg-red-50 text-red-700';
      case 'neutral':
        return 'border-yellow-200 bg-yellow-50 text-yellow-700';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasActiveFilters = searchQuery.trim() || filters.mood !== "all" || filters.dateRange !== "all" || filters.sortBy !== "newest";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-card bg-gradient-card border-0">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Search className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl bg-gradient-hero bg-clip-text text-transparent">
            Search Your Memories
          </CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">
          Find and explore your wellness journey through your journal entries
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your memories, moods, or AI insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base border-2 border-accent/30 focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-all duration-300"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={filters.mood} onValueChange={(value) => setFilters(prev => ({ ...prev, mood: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by mood" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Moods</SelectItem>
              <SelectItem value="positive">
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-green-600" />
                  Positive
                </div>
              </SelectItem>
              <SelectItem value="neutral">
                <div className="flex items-center gap-2">
                  <Meh className="h-4 w-4 text-yellow-600" />
                  Neutral
                </div>
              </SelectItem>
              <SelectItem value="negative">
                <div className="flex items-center gap-2">
                  <Frown className="h-4 w-4 text-red-600" />
                  Negative
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              {searchQuery.trim() && (
                <SelectItem value="relevance">Most Relevant</SelectItem>
              )}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredMemories.length} of {memories.length} entries
            </Badge>
            {hasActiveFilters && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Filtered
              </Badge>
            )}
          </div>
        </div>

        {/* Search Results */}
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {filteredMemories.length > 0 ? (
              filteredMemories.map((memory, index) => (
                <div
                  key={memory.id}
                  className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-accent/30 shadow-gentle hover:shadow-card transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(memory.created_at)}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{formatTime(memory.created_at)}</span>
                    </div>
                    
                    {memory.sentiment_label && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getMoodColor(memory.sentiment_label)}`}>
                        {getMoodIcon(memory.sentiment_label)}
                        <span className="capitalize">{memory.sentiment_label}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="text-foreground leading-relaxed mb-3">
                    {highlightText(memory.content, searchQuery)}
                  </div>
                  
                  {/* AI Feedback */}
                  {memory.ai_feedback && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-xs font-medium text-primary">AI Wellness Insight</span>
                      </div>
                      <div className="text-sm text-primary/80 italic">
                        "{highlightText(memory.ai_feedback, searchQuery)}"
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                {hasActiveFilters ? (
                  <div>
                    <p className="text-muted-foreground mb-2">No memories match your search criteria</p>
                    <Button variant="outline" onClick={clearFilters} className="text-sm">
                      Clear filters to see all entries
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No memories found. Start writing your first entry!</p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
