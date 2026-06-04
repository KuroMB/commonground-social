import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function supabaseUrl() {
  return (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!;
}
function supabaseKey() {
  return (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";

  const code       = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type       = searchParams.get("type") ?? "magiclink";

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl(), supabaseKey(), {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  let authError = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    user = data.user;
    authError = error;
  } else if (token_hash) {
    // Magic links sent server-side use token_hash instead of PKCE code
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "magiclink" | "email",
    });
    user = data.user;
    authError = error;
  }

  if (authError) {
    console.error("auth callback error:", authError.message);
    const detail = encodeURIComponent(authError.message);
    return NextResponse.redirect(`${origin}/join?error=link_failed&detail=${detail}`);
  }

  if (!code && !token_hash) {
    // Log all params for debugging
    const allParams = Object.fromEntries(searchParams.entries());
    console.error("auth callback: no code or token_hash. params:", allParams);
    return NextResponse.redirect(`${origin}/join?error=missing_token`);
  }

  if (user) {
    const admin = createServiceClient(supabaseUrl(), supabaseKey());
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.redirect(`${origin}/profile/new?next=${encodeURIComponent(next)}`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/join?error=link_expired`);
}
