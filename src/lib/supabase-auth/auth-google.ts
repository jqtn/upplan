"use server";

import { createClient } from "@/lib/supabase-auth/server-client";
import { redirect } from "next/navigation";

// ---------------------------------------------
// Googleログイン
// ---------------------------------------------
export async function signInWithGoogle() {
  const supabase = await createClient();
  const {
    data: { url },
    error,
  } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL}/api/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (!error && url) {
    redirect(url);
  }
}

// ---------------------------------------------
// Googleログアウト
// ---------------------------------------------
export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  return error ? false : true;
}
