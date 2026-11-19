import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

// Solo paths internos: "//evil.com" o una URL absoluta serían un open redirect.
function safeNext(next: string | null) {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (!code) redirect("/auth/error?reason=missing_code");

  // PKCE: canjea el code por la sesión con el code_verifier que dejó signUp en este browser.
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/confirm]", error);
    redirect("/auth/error?reason=link_invalid");
  }

  redirect(next);
}
