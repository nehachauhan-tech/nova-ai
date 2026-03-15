import Link from "next/link";
import NovaLogo from "@/components/ui/NovaLogo";
import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "Log In | Nova AI",
  description: "Sign in to your Nova AI account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10">
        <NovaLogo size={32} />
        <span className="font-logo text-xl font-bold tracking-wider uppercase">
          NOVA AI
        </span>
      </Link>

      {/* Card */}
      <div className="glass-card p-8 w-full max-w-md">
        <h1 className="font-display text-2xl font-bold text-center mb-2">
          Welcome back
        </h1>
        <p className="text-text-muted text-sm text-center mb-8">
          Sign in to continue to your dashboard.
        </p>

        <div className="flex justify-center">
          <AuthForm mode="login" />
        </div>

        <p className="text-text-muted text-sm text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-accent hover:text-accent/80 font-medium transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
