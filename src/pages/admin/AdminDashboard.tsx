import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EnquiriesManager } from "@/components/admin/EnquiriesManager";
import { ImagesManager } from "@/components/admin/ImagesManager";
import { PageMeta } from "@/components/page-meta";
import { useAuth } from "@/lib/auth";

const tabs = [
  { id: "images", label: "Website images" },
  { id: "enquiries", label: "Enquiries" },
] as const;

export default function AdminDashboard() {
  const { session, isAdmin, loading, signOut } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("images");

  if (loading) return <p className="p-10 text-sm text-muted-foreground">Loading…</p>;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Admin | DSQUARE OFFICIAL WEAR" description="Website admin" noindex />
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">Admin</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm" className="rounded-none">
              <Link to="/">View website</Link>
            </Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-none" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-10">
        <h1 className="editorial-heading text-5xl">Manage your website</h1>
        <div role="tablist" className="mt-8 flex gap-6 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 pb-3 text-xs font-semibold uppercase tracking-[0.12em] ${
                tab === t.id ? "border-gold text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-8">{tab === "images" ? <ImagesManager /> : <EnquiriesManager />}</div>
      </main>
    </div>
  );
}
