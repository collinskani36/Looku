import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", () => {
  const rows = [{ slot: "logo", image_path: "logo/test.jpg", alt: "", updated_at: "2026-01-01" }];
  return {
    isSupabaseConfigured: true,
    IMAGE_BUCKET: "site-images",
    supabase: {
      from: () => ({ select: () => Promise.resolve({ data: rows, error: null }) }),
      storage: {
        from: () => ({ getPublicUrl: (p: string) => ({ data: { publicUrl: `https://cdn.test/${p}` } }) }),
      },
      rpc: () => Promise.resolve({ data: false, error: null }),
      auth: {
        onAuthStateChange: (cb: (e: string, s: null) => void) => {
          setTimeout(() => cb("INITIAL_SESSION", null), 0);
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        signInWithPassword: () => Promise.resolve({ error: null }),
        signOut: () => Promise.resolve({}),
      },
    },
  };
});

import { AppRoutes } from "@/App";
import { AuthProvider } from "@/lib/auth";

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("App routing", () => {
  it("renders the home page at /", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/DSQUARE/);
  });

  it.each(["/collections", "/our-craft", "/about-us", "/contact"])("renders %s", (path) => {
    renderAt(path);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("shows the 404 page for unknown routes", () => {
    renderAt("/nope");
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("loads the header logo from Supabase storage", async () => {
    renderAt("/");
    await waitFor(() => {
      const logo = document.querySelector('header img[width="45"]') as HTMLImageElement | null;
      expect(logo?.getAttribute("src")).toBe("https://cdn.test/logo/test.jpg");
    });
  });

  it("sends signed-out visitors from /admin to the sign-in page", async () => {
    renderAt("/admin");
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });
});
