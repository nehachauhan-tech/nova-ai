import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NovaLogo from "@/components/ui/NovaLogo";
import { ArrowLeft, User } from "lucide-react";
import UserProfileForm from "@/components/profile/UserProfileForm";

export const metadata = {
  title: "Profile | Nova AI",
  description: "Manage your Nova AI account and preferences.",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the user's profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, preferences")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-surface-border px-6 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="btn-outline p-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <NovaLogo size={24} />
              <span className="font-logo text-sm font-bold tracking-wider uppercase">
                NOVA AI
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
            <User className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Profile Settings</h1>
            <p className="text-text-muted text-sm">{user.email}</p>
          </div>
        </div>

        <div className="glass-card p-8 bg-surface/30">
          <UserProfileForm
            initialFullName={profile?.full_name || ""}
            initialPreferences={profile?.preferences || {}}
          />
        </div>
      </main>
    </div>
  );
}
