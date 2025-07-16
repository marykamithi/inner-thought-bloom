-- Complete database schema for Inner Thought Bloom wellness journaling app

-- Create memories table for storing user journal entries
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  sentiment_label TEXT, -- 'positive', 'neutral', 'negative', 'happy', 'sad', 'anxious', 'excited', 'calm', 'angry'
  ai_feedback TEXT,
  mood_intensity INTEGER CHECK (mood_intensity >= 1 AND mood_intensity <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wellness_goals table
CREATE TABLE IF NOT EXISTS public.wellness_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wellness_metrics table for daily tracking
CREATE TABLE IF NOT EXISTS public.wellness_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  exercise_minutes INTEGER CHECK (exercise_minutes >= 0),
  water_glasses INTEGER CHECK (water_glasses >= 0),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
-- Policies for memories table
DROP POLICY IF EXISTS "Users can view their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can create their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can update their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can delete their own memories" ON public.memories;

CREATE POLICY "Users can view their own memories" 
ON public.memories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memories" 
ON public.memories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" 
ON public.memories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" 
ON public.memories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for wellness_goals table
DROP POLICY IF EXISTS "Users can view their own wellness goals" ON public.wellness_goals;
DROP POLICY IF EXISTS "Users can create their own wellness goals" ON public.wellness_goals;
DROP POLICY IF EXISTS "Users can update their own wellness goals" ON public.wellness_goals;
DROP POLICY IF EXISTS "Users can delete their own wellness goals" ON public.wellness_goals;

CREATE POLICY "Users can view their own wellness goals" 
ON public.wellness_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wellness goals" 
ON public.wellness_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness goals" 
ON public.wellness_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wellness goals" 
ON public.wellness_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for wellness_metrics table
DROP POLICY IF EXISTS "Users can view their own wellness metrics" ON public.wellness_metrics;
DROP POLICY IF EXISTS "Users can create their own wellness metrics" ON public.wellness_metrics;
DROP POLICY IF EXISTS "Users can update their own wellness metrics" ON public.wellness_metrics;
DROP POLICY IF EXISTS "Users can delete their own wellness metrics" ON public.wellness_metrics;

CREATE POLICY "Users can view their own wellness metrics" 
ON public.wellness_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wellness metrics" 
ON public.wellness_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness metrics" 
ON public.wellness_metrics 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wellness metrics" 
ON public.wellness_metrics 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist, then create new ones
DROP TRIGGER IF EXISTS update_memories_updated_at ON public.memories;
DROP TRIGGER IF EXISTS update_wellness_goals_updated_at ON public.wellness_goals;
DROP TRIGGER IF EXISTS update_wellness_metrics_updated_at ON public.wellness_metrics;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_memories_updated_at
BEFORE UPDATE ON public.memories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wellness_goals_updated_at
BEFORE UPDATE ON public.wellness_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wellness_metrics_updated_at
BEFORE UPDATE ON public.wellness_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memories_user_id_created_at ON public.memories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_goals_user_id_created_at ON public.wellness_goals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_metrics_user_id_date ON public.wellness_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_memories_sentiment_label ON public.memories(sentiment_label);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON public.memories(created_at DESC);
