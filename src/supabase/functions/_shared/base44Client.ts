// Shared Supabase client for all Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
export const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

export async function getUser(
  req: Request
): Promise<AuthUser | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  return user
    ? { id: user.id, email: user.email!, role: user.role }
    : null;
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}