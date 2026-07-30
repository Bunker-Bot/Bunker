export interface ErrorResponseOptions {
  code: string;
  message: string;
  status?: number;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-signature',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

export function createErrorResponse(options: ErrorResponseOptions): Response {
  const { code, message, status = 400 } = options;
  return new Response(
    JSON.stringify({
      success: false,
      code,
      message,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}
