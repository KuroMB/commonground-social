"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";

function getSupabase() {
  return createServiceClient(
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!
  );
}

export type ResourceState = { error?: string; id?: string };

export async function createListing(
  _prev: ResourceState,
  formData: FormData
): Promise<ResourceState> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first." };

  const canonical_tag_id = formData.get("canonical_tag_id") as string;
  const notes            = (formData.get("notes") as string)?.trim() || null;
  const listing_type     = (formData.get("listing_type") as string) === "need" ? "need" : "offer";

  if (!canonical_tag_id) return { error: "Pick something to share." };

  const db = getSupabase();

  // Get zip from profile for denormalization
  const { data: profile } = await db
    .from("profiles")
    .select("zip_code")
    .eq("id", user.id)
    .maybeSingle();

  const { data, error } = await db.from("user_resources").insert({
    profile_id:       user.id,
    canonical_tag_id,
    notes,
    listing_type,
    is_available:     true,
    zip_code:         profile?.zip_code ?? null,
  }).select("id").single();

  if (error) {
    console.error("resource insert error:", error);
    return { error: "Something went wrong. Try again?" };
  }

  return { id: data.id };
}

export async function getCanonicalTags() {
  const { data } = await getSupabase()
    .from("canonical_tags")
    .select("id, slug, display_name, is_consumable")
    .order("display_name");
  return data ?? [];
}
