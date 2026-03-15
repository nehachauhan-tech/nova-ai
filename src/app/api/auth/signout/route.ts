import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Route handler to sign out the user and redirect to the home page.
 */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
