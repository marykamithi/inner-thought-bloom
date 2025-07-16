import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a supportive mental health assistant. Analyze the sentiment of journal entries and provide compassionate feedback. Return a JSON object with:
            - sentiment_score: number between -1 (very negative) and 1 (very positive)
            - sentiment_label: "positive", "neutral", or "negative"
            - feedback: encouraging message tailored to the sentiment (max 100 words)` 
          },
          { role: 'user', content: `Analyze this journal entry: "${content}"` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-sentiment function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      sentiment_score: 0,
      sentiment_label: 'neutral',
      feedback: 'Unable to analyze your entry right now, but remember that journaling is a great step for mental wellness!'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});