import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/page-meta";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function AdminLogin() {
  const { session, isAdmin, loading, signIn, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && session && isAdmin) return <Navigate to="/admin" replace />;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    const message = await signIn(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
    if (message) setError(message);
    setBusy(false);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <PageMeta title="Admin sign in | DSQUARE OFFICIAL WEAR" description="Admin sign in" noindex />
      <div className="w-full max-w-sm">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">Admin</p>
        <h1 className="editorial-heading mt-3 text-5xl">Sign in</h1>

        {!isSupabaseConfigured && (
          <p className="mt-6 text-sm text-destructive">
            Supabase isn’t configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.
          </p>
        )}

        {session && !loading && !isAdmin ? (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-destructive">
              {session.user.email} is signed in but isn’t an authorised admin. Ask an existing admin to add you.
            </p>
            <Button type="button" variant="outline" className="rounded-none" onClick={signOut}>
              Sign out
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <label className="block text-xs font-medium text-foreground">
              Email
              <input className="form-field mt-2" type="email" name="email" autoComplete="email" required />
            </label>
            <label className="block text-xs font-medium text-foreground">
              Password
              <input className="form-field mt-2" type="password" name="password" autoComplete="current-password" required />
            </label>
            <Button
              type="submit"
              disabled={busy || !isSupabaseConfigured}
              className="button-gold h-12 w-full rounded-none text-xs font-semibold uppercase tracking-[0.12em] shadow-none"
            >
              {busy ? "Signing in…" : "Sign in"}
            </Button>
            <p role="alert" className="min-h-5 text-sm text-destructive">{error}</p>
          </form>
        )}

        <Link to="/" className="mt-8 inline-block text-xs text-muted-foreground underline underline-offset-4">
          ← Back to website
        </Link>
      </div>
    </main>
  );
}
