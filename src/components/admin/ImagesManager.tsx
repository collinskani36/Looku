import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  IMAGE_SLOTS,
  SITE_IMAGES_KEY,
  publicImageUrl,
  useSiteImages,
  type ImageSlot,
  type SiteImageRow,
} from "@/hooks/use-site-images";
import { useAuth } from "@/lib/auth";
import { IMAGE_BUCKET, supabase } from "@/lib/supabase";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function SlotCard({ slot, label, usedOn, row }: { slot: ImageSlot; label: string; usedOn: string; row: SiteImageRow | undefined }) {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState(row?.alt ?? "");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const preview = file ? URL.createObjectURL(file) : row ? publicImageUrl(row.image_path) : null;
  const dirty = file !== null || alt !== (row?.alt ?? "");

  function pick(next: File | null) {
    setStatus(null);
    if (next && !ALLOWED.includes(next.type)) {
      setStatus({ ok: false, text: "Please choose a JPG, PNG, WebP or AVIF image." });
      return;
    }
    if (next && next.size > MAX_BYTES) {
      setStatus({ ok: false, text: "That image is over 5 MB. Please compress it and try again." });
      return;
    }
    setFile(next);
  }

  async function save() {
    setBusy(true);
    setStatus(null);
    try {
      let imagePath = row?.image_path;
      const oldPath = row?.image_path;

      if (file) {
        const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        imagePath = `${slot}/${Date.now()}.${ext || "jpg"}`;
        const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(imagePath, file, {
          contentType: file.type,
          cacheControl: "31536000",
        });
        if (error) throw error;
      }
      if (!imagePath) throw new Error("Choose an image first.");

      const { error: rowError } = await supabase.from("site_images").upsert({
        slot,
        image_path: imagePath,
        alt: alt.trim(),
        updated_at: new Date().toISOString(),
        updated_by: session?.user.id ?? null,
      });
      if (rowError) throw rowError;

      if (file && oldPath && oldPath !== imagePath) {
        await supabase.storage.from(IMAGE_BUCKET).remove([oldPath]); // best effort
      }

      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await queryClient.invalidateQueries({ queryKey: SITE_IMAGES_KEY });
      setStatus({ ok: true, text: "Saved. The website now shows this image." });
    } catch (err) {
      console.error(err);
      setStatus({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="flex flex-col border border-border bg-card">
      <div className="aspect-[4/3] bg-muted">
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted-foreground">No image yet</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="editorial-heading text-2xl">{label}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{usedOn}</p>
        </div>
        <label className="block text-xs font-medium text-foreground">
          Replace image
          <input
            ref={fileRef}
            type="file"
            accept={ALLOWED.join(",")}
            className="form-field mt-2"
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="block text-xs font-medium text-foreground">
          Description for screen readers (optional)
          <input
            type="text"
            className="form-field mt-2"
            value={alt}
            maxLength={200}
            placeholder="Leave blank to use the default"
            onChange={(e) => setAlt(e.target.value)}
          />
        </label>
        <div className="mt-auto">
          <Button
            type="button"
            disabled={busy || !dirty}
            onClick={save}
            className="button-gold h-11 rounded-none px-6 text-xs font-semibold uppercase tracking-[0.12em] shadow-none"
          >
            {busy ? "Saving…" : "Save"}
          </Button>
          <p role="status" aria-live="polite" className={`mt-3 min-h-5 text-xs ${status?.ok ? "text-foreground" : "text-destructive"}`}>
            {status?.text}
          </p>
        </div>
      </div>
    </article>
  );
}

export function ImagesManager() {
  const { data, isLoading, error } = useSiteImages();

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading images…</p>;
  if (error) return <p className="text-sm text-destructive">Could not load images: {error.message}</p>;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {IMAGE_SLOTS.map((s) => (
        // key includes updated_at so the card resets after a save
        <SlotCard key={`${s.slot}-${data?.[s.slot]?.updated_at ?? "new"}`} {...s} row={data?.[s.slot]} />
      ))}
    </div>
  );
}
