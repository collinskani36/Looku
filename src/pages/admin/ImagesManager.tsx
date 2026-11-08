import { useEffect, useMemo, useRef, useState } from "react";
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

type Status = { ok: boolean; text: string } | null;

function useObjectUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}

function check(file: File | null): string | null {
  if (!file) return null;
  if (!ALLOWED.includes(file.type)) return "Please choose a JPG, PNG, WebP or AVIF image.";
  if (file.size > MAX_BYTES) return "That image is over 5 MB. Please compress it and try again.";
  return null;
}

async function uploadImage(slot: string, prefix: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${slot}/${prefix}${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw error;
  return path;
}

function Preview({ src, label, ratio }: { src: string | null; label: string; ratio: string }) {
  return (
    <div>
      <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <div className={`${ratio} overflow-hidden bg-muted`}>
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center px-2 text-center text-xs text-muted-foreground">No image yet</div>
        )}
      </div>
    </div>
  );
}

function FilePicker({ label, hint, inputRef, onPick }: { label: string; hint?: string; inputRef: React.RefObject<HTMLInputElement | null>; onPick: (f: File | null) => void }) {
  return (
    <label className="block text-xs font-medium text-foreground">
      {label}
      {hint && <span className="mt-0.5 block font-normal text-muted-foreground">{hint}</span>}
      <input ref={inputRef} type="file" accept={ALLOWED.join(",")} className="form-field mt-2" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
    </label>
  );
}

function SlotCard({ slot, label, usedOn, optional, dual, row }: { slot: ImageSlot; label: string; usedOn: string; optional?: boolean; dual?: boolean; row: SiteImageRow | undefined }) {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [alt, setAlt] = useState(row?.alt ?? "");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const desktopBlob = useObjectUrl(file);
  const mobileBlob = useObjectUrl(mobileFile);
  const desktopPreview = desktopBlob ?? (row ? publicImageUrl(row.image_path) : null);
  const mobilePreview = mobileBlob ?? (row?.mobile_image_path ? publicImageUrl(row.mobile_image_path) : null);
  const dirty = file !== null || mobileFile !== null || alt !== (row?.alt ?? "");

  function pick(kind: "desktop" | "mobile", next: File | null) {
    const problem = check(next);
    setStatus(problem ? { ok: false, text: problem } : null);
    if (problem) return;
    if (kind === "desktop") setFile(next);
    else setMobileFile(next);
  }

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: SITE_IMAGES_KEY });
  }

  async function save() {
    setBusy(true);
    setStatus(null);
    try {
      if (!row && !file) throw new Error("Choose the main (desktop) image first.");
      const imagePath = file ? await uploadImage(slot, "", file) : row!.image_path;
      const mobilePath = mobileFile ? await uploadImage(slot, "m-", mobileFile) : (row?.mobile_image_path ?? null);

      const { error } = await supabase.from("site_images").upsert({
        slot,
        image_path: imagePath,
        mobile_image_path: mobilePath,
        alt: alt.trim(),
        updated_at: new Date().toISOString(),
        updated_by: session?.user.id ?? null,
      });
      if (error) throw error;

      // Best-effort cleanup of replaced files.
      const stale = [
        file && row?.image_path && row.image_path !== imagePath ? row.image_path : null,
        mobileFile && row?.mobile_image_path && row.mobile_image_path !== mobilePath ? row.mobile_image_path : null,
      ].filter((p): p is string => Boolean(p));
      if (stale.length) await supabase.storage.from(IMAGE_BUCKET).remove(stale);

      setFile(null);
      setMobileFile(null);
      if (fileRef.current) fileRef.current.value = "";
      if (mobileRef.current) mobileRef.current.value = "";
      await refresh();
      setStatus({ ok: true, text: "Saved. The website now shows this image." });
    } catch (err) {
      console.error(err);
      setStatus({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  async function removeMobile() {
    if (!row?.mobile_image_path || !window.confirm("Remove the mobile image? Phones will use the desktop image instead.")) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("site_images").update({ mobile_image_path: null }).eq("slot", slot);
      if (error) throw error;
      await supabase.storage.from(IMAGE_BUCKET).remove([row.mobile_image_path]);
      await refresh();
    } catch (err) {
      console.error(err);
      setStatus({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
      setBusy(false);
    }
  }

  async function removeSlot() {
    if (!row || !window.confirm(`Remove "${label}"? It will disappear from the website.`)) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("site_images").delete().eq("slot", slot);
      if (error) throw error;
      await supabase.storage.from(IMAGE_BUCKET).remove([row.image_path, ...(row.mobile_image_path ? [row.mobile_image_path] : [])]);
      await refresh();
    } catch (err) {
      console.error(err);
      setStatus({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
      setBusy(false);
    }
  }

  return (
    <article className="flex flex-col border border-border bg-card">
      <div className="p-5 pb-0">
        {dual ? (
          <div className="grid grid-cols-[2fr_1fr] gap-3">
            <Preview src={desktopPreview} label="Desktop" ratio="aspect-video" />
            <Preview src={mobilePreview} label="Mobile" ratio="aspect-[9/16]" />
          </div>
        ) : (
          <Preview src={desktopPreview} label="Current image" ratio="aspect-[4/3]" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="editorial-heading text-2xl">{label}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{usedOn}</p>
        </div>

        <FilePicker
          inputRef={fileRef}
          onPick={(f) => pick("desktop", f)}
          label={dual ? "Desktop image (wide)" : "Replace image"}
          {...(dual ? { hint: "Best: wide 16:9, e.g. 2400×1350. Keep people in the middle." } : {})}
        />
        {dual && (
          <FilePicker
            inputRef={mobileRef}
            onPick={(f) => pick("mobile", f)}
            label="Mobile image (tall, optional)"
            hint="Best: tall 9:16, e.g. 1080×1920. If empty, phones use the desktop image."
          />
        )}

        <label className="block text-xs font-medium text-foreground">
          Description for screen readers (optional)
          <input type="text" className="form-field mt-2" value={alt} maxLength={200} placeholder="Leave blank to use the default" onChange={(e) => setAlt(e.target.value)} />
        </label>

        <div className="mt-auto">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" disabled={busy || !dirty} onClick={save} className="button-gold h-11 rounded-none px-6 text-xs font-semibold uppercase tracking-[0.12em] shadow-none">
              {busy ? "Saving…" : "Save"}
            </Button>
            {dual && row?.mobile_image_path && (
              <Button type="button" variant="ghost" disabled={busy} onClick={removeMobile} className="h-11 rounded-none text-xs">
                Remove mobile image
              </Button>
            )}
            {optional && row && (
              <Button type="button" variant="ghost" disabled={busy} onClick={removeSlot} className="h-11 rounded-none text-xs text-destructive">
                Remove slide
              </Button>
            )}
          </div>
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
    <>
    <p className="mb-6 text-xs text-muted-foreground">Images screen v2 · the four “Home hero” cards have separate Desktop and Mobile uploads.</p>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {IMAGE_SLOTS.map((s) => (
        // key includes updated_at so the card resets after a save
        <SlotCard key={`${s.slot}-${data?.[s.slot]?.updated_at ?? "new"}`} {...s} row={data?.[s.slot]} />
      ))}
    </div>
    </>
  );
}
