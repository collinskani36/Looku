// Uploads the original site photos from supabase/seed-images/ into the
// "site-images" bucket and creates the matching site_images rows.
//
// Usage (after running supabase/schema.sql):
//   node --env-file=.env scripts/seed-images.mjs
//
// Needs SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.
// The service-role key is a secret: never prefix it with VITE_ and never commit it.
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL (or VITE_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../supabase/seed-images");
const slots = ["logo", "hero", "official", "uniforms", "craft", "fitting", "collection"];

for (const slot of slots) {
  const body = await readFile(path.join(dir, `${slot}.jpg`));
  const imagePath = `${slot}/original.jpg`;
  const { error: upErr } = await supabase.storage
    .from("site-images")
    .upload(imagePath, body, { contentType: "image/jpeg", upsert: true });
  if (upErr) throw new Error(`Upload failed for ${slot}: ${upErr.message}`);

  const { error: rowErr } = await supabase
    .from("site_images")
    .upsert({ slot, image_path: imagePath, alt: "", updated_at: new Date().toISOString() });
  if (rowErr) throw new Error(`Row failed for ${slot}: ${rowErr.message}`);
  console.log(`✓ ${slot}`);
}
console.log("Done.");
