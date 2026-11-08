import type { ImgHTMLAttributes } from "react";
import { publicImageUrl, useSiteImages, type ImageSlot } from "@/hooks/use-site-images";

type SlotImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  slot: ImageSlot;
  /** Used when the admin hasn't set custom alt text for this image. */
  alt: string;
};

/** An <img> whose source is managed from the admin area (Supabase Storage). */
export function SlotImg({ slot, alt, className, ...rest }: SlotImgProps) {
  const { data } = useSiteImages();
  const row = data?.[slot];

  if (!row) {
    // Still loading, or no image uploaded for this slot yet: keep the layout, show a placeholder.
    return <div aria-hidden="true" className={`${className ?? ""} bg-muted`} />;
  }

  return <img {...rest} src={publicImageUrl(row.image_path)} alt={row.alt || alt} className={className} />;
}
