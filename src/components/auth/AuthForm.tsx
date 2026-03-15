"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;
        setSuccessMessage(
          "Account created! Check your email to confirm your account."
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Success Display */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {successMessage}
        </div>
      )}

      {/* Full Name (signup only) */}
      {mode === "signup" && (
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface border border-surface-border text-foreground placeholder:text-text-muted text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
          />
        </div>
      )}

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface border border-surface-border text-foreground placeholder:text-text-muted text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface border border-surface-border text-foreground placeholder:text-text-muted text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-accent w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </span>
      </button>
    </form>
  );
}
