import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";

const lovableAuth = createLovableAuth({});

export const signInWithGoogle = async (redirectUri?: string) => {
  const result = await lovableAuth.signInWithOAuth('google', {
    redirect_uri: redirectUri ?? window.location.origin,
    extraParams: {
      supabase_project_ref: import.meta.env.VITE_SUPABASE_PROJECT_ID,
    },
  } as Parameters<typeof lovableAuth.signInWithOAuth>[1]);

  if (result.redirected) {
    return result;
  }

  if (result.error) {
    return result;
  }

  try {
    await supabase.auth.setSession(result.tokens);
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
  return result;
};
