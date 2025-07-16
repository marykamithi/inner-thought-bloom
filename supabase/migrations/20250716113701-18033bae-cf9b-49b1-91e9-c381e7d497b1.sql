-- Create memories table for storing user journal entries
CREATE TABLE public.memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  sentiment_label TEXT, -- 'positive', 'neutral', 'negative'
  ai_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
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

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_memories_updated_at
BEFORE UPDATE ON public.memories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();