import Link from "next/link";
import { Sparkles } from "lucide-react";
import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "Sign Up | Nova AI",
  description: "Create your Nova AI account.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <span className="font-logo text-xl font-bold tracking-wider uppercase">
          NOVA AI
        </span>
      </Link>

      {/* Card */}
      <div className="glass-card p-8 w-full max-w-md">
        <h1 className="font-display text-2xl font-bold text-center mb-2">
          Create an account
        </h1>
        <p className="text-text-muted text-sm text-center mb-8">
          Get started with Nova AI for free.
        </p>

        <div className="flex justify-center">
          <AuthForm mode="signup" />
        </div>

        <p className="text-text-muted text-sm text-center mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent hover:text-accent/80 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
