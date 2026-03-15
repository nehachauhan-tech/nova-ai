import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NovaLogo from "@/components/ui/NovaLogo";
import {
  Plus,
  MessageSquare,
  LogOut,
  Clock,
  User,
} from "lucide-react";

export const metadata = {
  title: "Dashboard | Nova AI",
  description: "Your Nova AI conversations.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's conversations
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, title, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-surface-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <NovaLogo size={32} />
            <span className="font-logo text-lg font-bold tracking-wider uppercase">
              NOVA AI
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary hidden sm:block">
              {displayName}
            </span>
            <Link
              href="/profile"
              className="btn-outline px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Profile
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="btn-outline px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">
              Hey, {displayName}
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Your conversations with Nova AI.
            </p>
          </div>
          <Link
            href="/chat/new"
            className="btn-accent px-5 py-3 rounded-xl text-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Chat
            </span>
          </Link>
        </div>

        {/* Conversations List */}
        {conversations && conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((convo) => (
              <Link
                key={convo.id}
                href={`/chat/${convo.id}`}
                className="glass-card p-5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <MessageSquare className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">
                      {convo.title}
                    </h3>
                    <p className="text-text-muted text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(convo.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <MessageSquare className="w-10 h-10 text-text-muted mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">
              No conversations yet
            </h3>
            <p className="text-text-muted text-sm mb-6">
              Start your first conversation with Nova AI.
            </p>
            <Link
              href="/chat/new"
              className="btn-accent inline-flex px-6 py-3 rounded-xl text-sm font-semibold"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Start a Conversation
              </span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
