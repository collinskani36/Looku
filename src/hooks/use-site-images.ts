import { useQuery } from "@tanstack/react-query";
import { IMAGE_BUCKET, isSupabaseConfigured, supabase } from "@/lib/supabase";

export type ImageSlot =
  | "logo"
  | "hero"
  | "hero_2"
  | "hero_3"
  | "hero_4"
  | "official"
  | "uniforms"
  | "craft"
  | "fitting"
  | "collection";

/** Every image the admin can replace, and where it shows on the site. */
export const IMAGE_SLOTS: { slot: ImageSlot; label: string; usedOn: string; optional?: boolean; dual?: boolean }[] = [
  { slot: "logo", label: "Logo", usedOn: "Header and footer (shown round)" },
  { slot: "hero", label: "Home hero", usedOn: "Home page slideshow (first slide), and the Designer Suits tile", dual: true },
  { slot: "hero_2", label: "Home hero: slide 2", usedOn: "Optional. Added to the home page slideshow", optional: true, dual: true },
  { slot: "hero_3", label: "Home hero: slide 3", usedOn: "Optional. Added to the home page slideshow", optional: true, dual: true },
  { slot: "hero_4", label: "Home hero: slide 4", usedOn: "Optional. Added to the home page slideshow", optional: true, dual: true },
  { slot: "official", label: "Men’s official wear", usedOn: "Home page story section" },
  { slot: "fitting", label: "Tailoring & fitting", usedOn: "Tailoring stories, and the Custom Tailoring tile" },
  { slot: "uniforms", label: "Uniforms", usedOn: "Uniform stories, and the School Uniforms tile" },
  { slot: "craft", label: "Craft & workshop", usedOn: "Craft stories, About/Craft headers, and the Institutional Wear tile" },
  { slot: "collection", label: "Collections header", usedOn: "Collections page header, and the Men’s Official Wear tile" },
];

export type SiteImageRow = {
  slot: string;
  image_path: string;
  mobile_image_path: string | null;
  alt: string;
  updated_at: string;
};

export const SITE_IMAGES_KEY = ["site-images"] as const;

export function publicImageUrl(path: string): string {
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function fetchSiteImages(): Promise<Record<string, SiteImageRow>> {
  if (!isSupabaseConfigured) return {};
  const { data, error } = await supabase.from("site_images").select("*");
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

/** Slideshow order on the home page. Empty optional slots are skipped. */
export const HERO_SLOTS: ImageSlot[] = ["hero", "hero_2", "hero_3", "hero_4"];
