-- Add mood_intensity column to memories table
ALTER TABLE memories ADD COLUMN mood_intensity INTEGER;

-- Create wellness_goals table
CREATE TABLE wellness_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mood_entries table for detailed mood tracking
CREATE TABLE mood_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_type TEXT NOT NULL,
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wellness_metrics table for tracking various wellness indicators
CREATE TABLE wellness_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- 'sleep', 'exercise', 'water', 'energy', etc.
    value DECIMAL,
    unit TEXT,
    notes TEXT,
    recorded_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE wellness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for wellness_goals
CREATE POLICY "Users can view their own goals" ON wellness_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" ON wellness_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON wellness_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON wellness_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for mood_entries
CREATE POLICY "Users can view their own mood entries" ON mood_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood entries" ON mood_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries" ON mood_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries" ON mood_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for wellness_metrics
CREATE POLICY "Users can view their own wellness metrics" ON wellness_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wellness metrics" ON wellness_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness metrics" ON wellness_metrics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wellness metrics" ON wellness_metrics
    FOR DELETE USING (auth.uid() = user_id);
