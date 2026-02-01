import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      console.error('No audio file provided');
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Transcribing audio file: ${audioFile.name}, size: ${audioFile.size}, type: ${audioFile.type}`);

    // Convert audio to base64 for Gemini
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Use Lovable AI (Gemini) for transcription
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Transcription service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const languageNames: Record<string, string> = {
      'en': 'English',
      'hi': 'Hindi',
      'te': 'Telugu',
      'ta': 'Tamil',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'mr': 'Marathi',
      'gu': 'Gujarati',
      'bn': 'Bengali',
      'pa': 'Punjabi',
    };

    const languageName = languageNames[language] || 'English';

    console.log(`Using language: ${languageName}`);

    // Determine MIME type
    let mimeType = audioFile.type || 'audio/webm';
    if (mimeType === 'audio/webm;codecs=opus') {
      mimeType = 'audio/webm';
    }

    const response = await fetch('https://ai.lovable.dev/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a medical transcription assistant. Transcribe the following audio recording accurately. The audio is in ${languageName}. 

Important instructions:
1. Transcribe exactly what is spoken, word for word
2. If the audio contains medical terminology, transcribe it accurately
3. Include any punctuation that makes sense
4. If parts are unclear, indicate with [unclear]
5. Return ONLY the transcription text, no explanations or formatting

Transcribe the audio now:`
              },
              {
                type: 'file',
                file: {
                  filename: audioFile.name || 'recording.webm',
                  file_data: `data:${mimeType};base64,${base64Audio}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Transcription failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('AI response received:', JSON.stringify(result).substring(0, 200));

    const transcription = result.choices?.[0]?.message?.content || '';

    console.log(`Transcription successful: ${transcription.substring(0, 100)}...`);

    return new Response(
      JSON.stringify({ 
        text: transcription.trim(),
        language: language 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Transcription error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
