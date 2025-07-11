// Import with correct relative path for Supabase functions
import { corsHeaders } from 'shared/cors.ts';

// Define the expected message structure for type safety.
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Proper Deno.serve configuration for Supabase Edge Functions
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Received request to ai-assistant function.');
    const { messages: clientMessages }: { messages: Message[] } = await req.json();

    // Gemini uses a different role for the assistant ('model') and a different structure.
    const geminiContents = clientMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    console.log('Formatted contents for Gemini:', JSON.stringify(geminiContents, null, 2));

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiContents,
        // System instruction to set the AI's persona
        system_instruction: {
          parts: [{ text: "You are VAI, a friendly and expert virtual assistant for Filipino VAs. Be concise, helpful, and encouraging. Respond in English." }]
        },
      }),
    });

    const responseText = await response.text();
    console.log('Raw response from Gemini API:', responseText);

    if (!response.ok) {
      throw new Error(`Gemini API error (${response.status}): ${responseText}`);
    }

    const data = JSON.parse(responseText);

    if (data.error) {
      throw new Error(data.error.message);
    }

    const assistantResponseContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!assistantResponseContent) {
      throw new Error("No content found in Gemini's response.");
    }

    // Return the response in the format the client app expects
    return new Response(JSON.stringify({ role: 'assistant', content: assistantResponseContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error in Edge Function:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});