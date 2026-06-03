"use server";

import { createClient } from "@/lib/supabase/server";

type FeedbackState = { error?: string; success?: boolean };

export async function submitFeedback(_prev: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const message = (formData.get("message") as string)?.trim();
  const contact = (formData.get("contact") as string)?.trim() || null;
  const type = formData.get("type") as string;
  const pagePath = formData.get("page_path") as string | null;

  if (!message) return { error: "Please tell us what's on your mind." };
  if (message.length > 2000) return { error: "Message is too long (2000 chars max)." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("feedback").insert({
    type,
    message,
    contact,
    profile_id: user?.id ?? null,
    page_path: pagePath,
  });

  if (error) {
    console.error("feedback insert error:", error);
    return { error: "Something went wrong. Try again?" };
  }

  return { success: true };
}
