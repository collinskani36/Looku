import { useQuery } from "@tanstack/react-query";
import { IMAGE_BUCKET, isSupabaseConfigured, supabase } from "@/lib/supabase";

export type ImageSlot =
  | "logo"
  | "hero"
  | "official"
  | "uniforms"
  | "craft"
  | "fitting"
  | "collection";

/** Every image the admin can replace, and where it shows on the site. */
export const IMAGE_SLOTS: { slot: ImageSlot; label: string; usedOn: string }[] = [
  { slot: "logo", label: "Logo", usedOn: "Header and footer (shown round)" },
  { slot: "hero", label: "Home hero", usedOn: "Home page banner, and the Designer Suits tile" },
  { slot: "official", label: "Men’s official wear", usedOn: "Home page story section" },
  { slot: "fitting", label: "Tailoring & fitting", usedOn: "Tailoring stories, and the Custom Tailoring tile" },
  { slot: "uniforms", label: "Uniforms", usedOn: "Uniform stories, and the School Uniforms tile" },
  { slot: "craft", label: "Craft & workshop", usedOn: "Craft stories, About/Craft headers, and the Institutional Wear tile" },
  { slot: "collection", label: "Collections header", usedOn: "Collections page header, and the Men’s Official Wear tile" },
];

export type SiteImageRow = {
  slot: string;
  image_path: string;
  alt: string;
  updated_at: string;
};

export const SITE_IMAGES_KEY = ["site-images"] as const;

export function publicImageUrl(path: string): string {
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function fetchSiteImages(): Promise<Record<string, SiteImageRow>> {
  if (!isSupabaseConfigured) return {};
  const { data, error } = await supabase.from("site_images").select("slot, image_path, alt, updated_at");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((row: SiteImageRow) => [row.slot, row]));
}

export function useSiteImages() {
  return useQuery({
    queryKey: SITE_IMAGES_KEY,
    queryFn: fetchSiteImages,
    staleTime: 5 * 60 * 1000,
  });
}
