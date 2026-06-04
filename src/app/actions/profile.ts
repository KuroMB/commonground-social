"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getSupabase() {
  return createServiceClient(
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!
  );
}

async function geocodeZip(zip: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&countrycodes=US&format=json&limit=1`,
      { headers: { "User-Agent": "CommonGround/1.0 (commonground-social.vercel.app)" } }
    );
    const data = await res.json();
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch { /* non-fatal */ }
  return null;
}

export type ProfileState = { error?: string; success?: boolean };

export async function createProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const display_name = (formData.get("display_name") as string)?.trim();
  const zip_code     = (formData.get("zip_code") as string)?.trim();
  const neighborhood = (formData.get("neighborhood") as string)?.trim() || null;

  if (!display_name) return { error: "Display name is required." };
  if (!zip_code || !/^\d{5}$/.test(zip_code)) return { error: "Enter a valid 5-digit zip code." };

  const coords = await geocodeZip(zip_code);

  const { error } = await getSupabase().from("profiles").upsert({
    id: user.id,
    display_name,
    zip_code,
    neighborhood,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
  }, { onConflict: "id" });

  if (error) {
    console.error("profile upsert error:", error);
    return { error: "Something went wrong. Try again?" };
  }

  revalidatePath("/");
  return { success: true };
}
