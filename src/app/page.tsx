import Link from "next/link";
import HeroSceneLoader from "@/components/three/HeroSceneLoader";
import NovaLogo from "@/components/ui/NovaLogo";
import {
  Mic,
  MessageSquareText,
  BrainCircuit,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* ─── Navbar ─── */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-2.5">
          <NovaLogo size={32} />
          <span className="font-logo text-xl font-bold tracking-wider uppercase">
            NOVA AI
          </span>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide text-text-secondary">
          <Link href="#features" className="hover:text-foreground transition-colors duration-300">
            Features
          </Link>
          <Link href="#capabilities" className="hover:text-foreground transition-colors duration-300">
            Capabilities
          </Link>
          <Link href="#about" className="hover:text-foreground transition-colors duration-300">
            About
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="btn-accent px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2">
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium hidden sm:block text-text-secondary hover:text-foreground transition-colors duration-300"
              >
                Log In
              </Link>
              <Link href="/login" className="btn-accent px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 text-center mt-16 md:mt-24 max-w-5xl mx-auto overflow-visible">
        {/* 3D Background — rendered behind text */}
        <HeroSceneLoader />

        {/* Radial glow behind hero */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-glow-pulse pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surface-border bg-surface text-sm text-text-secondary mb-8">
            <Zap className="w-3.5 h-3.5 text-accent" />
            Powered by Amazon Nova on AWS Bedrock
          </div>

          <h1 className="animate-fade-in-up-delay-1 font-display text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.9] font-bold">
            <span className="gradient-text">Speak.</span>
            <br />
            <span className="text-foreground">Think.</span>
            <br />
            <span className="italic font-light text-text-secondary">Create.</span>
          </h1>

          <p className="animate-fade-in-up-delay-2 mt-8 text-base md:text-lg max-w-xl mx-auto text-text-muted leading-relaxed">
            The multi-modal AI assistant. Interact through voice, text, or audio — powered by cutting-edge Nova models via AWS Bedrock.
          </p>

          <div className="animate-fade-in-up-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? "/dashboard" : "/login"} className="btn-accent w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold flex items-center justify-center gap-2">
              {user ? "Go to Dashboard" : "Try Nova AI Free"}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href={user ? "/chat/new" : "/login"} className="btn-outline w-full sm:w-auto px-8 py-4 rounded-full text-base font-medium flex items-center justify-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Demo
            </Link>
          </div>
        </div>
      </main>

      {/* ─── Marquee Banner ─── */}
      <div className="w-full overflow-hidden whitespace-nowrap py-5 mt-32 md:mt-44 border-y border-surface-border">
        <div className="inline-block animate-scroll-marquee font-logo text-sm tracking-[0.3em] text-text-muted uppercase">
          <span className="mx-6 opacity-30">◆</span> MULTI-MODAL AI
          <span className="mx-6 opacity-30">◆</span> VOICE INPUT
          <span className="mx-6 opacity-30">◆</span> TEXT INPUT
          <span className="mx-6 opacity-30">◆</span> AUDIO PROCESSING
          <span className="mx-6 opacity-30">◆</span> AWS BEDROCK
          <span className="mx-6 opacity-30">◆</span> REAL-TIME RESPONSES
          <span className="mx-6 opacity-30">◆</span> MULTI-MODAL AI
          <span className="mx-6 opacity-30">◆</span> VOICE INPUT
          <span className="mx-6 opacity-30">◆</span> TEXT INPUT
          <span className="mx-6 opacity-30">◆</span> AUDIO PROCESSING
          <span className="mx-6 opacity-30">◆</span> AWS BEDROCK
          <span className="mx-6 opacity-30">◆</span> REAL-TIME RESPONSES
        </div>
      </div>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-28 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">
              Input Modes
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Your Way, Your Voice
            </h2>
            <p className="mt-4 text-text-muted max-w-md text-base leading-relaxed">
              Interact with Nova AI through any modality that feels natural to you.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Voice Input */}
          <div className="glass-card p-8 group">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors duration-300">
              <Mic className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-bold font-display mb-3">
              Voice Input
            </h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Speak naturally using your microphone. Nova transcribes and processes your voice in real-time for fluid, hands-free interaction.
            </p>
          </div>

          {/* Text Input */}
          <div className="glass-card p-8 group">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors duration-300">
              <MessageSquareText className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-bold font-display mb-3">
              Text Prompts
            </h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Type detailed prompts, questions, or instructions. Full markdown support with rich formatting for precise communication.
            </p>
          </div>

          {/* Audio Upload */}
          <div className="glass-card p-8 group">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors duration-300">
              <BrainCircuit className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-bold font-display mb-3">
              Audio Upload
            </h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Upload audio files directly. Nova analyzes, transcribes, and responds to pre-recorded audio seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Capabilities Section ─── */}
      <section
        id="capabilities"
        className="py-28 px-6 max-w-7xl mx-auto w-full"
      >
        <div className="text-center mb-16">
          <p className="text-accent-secondary text-sm font-semibold tracking-widest uppercase mb-3">
            Why Nova AI
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Built for the Future
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-5 h-5" />,
              title: "Lightning Fast",
              description:
                "Optimized inference via AWS Bedrock. Get responses in milliseconds, not seconds.",
            },
            {
              icon: <Shield className="w-5 h-5" />,
              title: "Enterprise Secure",
              description:
                "Your data stays yours. No training on your inputs. Full compliance with enterprise standards.",
            },
            {
              icon: <Globe className="w-5 h-5" />,
              title: "Multi-Language",
              description:
                "Nova understands and responds in multiple languages natively across all input modes.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="glass-card p-8 animate-shimmer group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-secondary/10 flex items-center justify-center mb-5 text-accent-secondary group-hover:bg-accent-secondary/20 transition-colors duration-300">
                {item.icon}
              </div>
              <h3 className="text-base font-bold font-display mb-2">
                {item.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Footer ─── */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background:
              "linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(0,212,170,0.05) 50%, rgba(108,99,255,0.08) 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 border-t border-surface-border"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Ready to experience
            <br />
            <span className="gradient-text">the future?</span>
          </h2>
          <p className="text-text-muted max-w-lg mx-auto mb-10 text-base leading-relaxed">
            Start a conversation with Nova AI. Type, speak, or upload — it
            understands it all.
          </p>
          <Link 
            href={user ? "/dashboard" : "/login"} 
            className="btn-accent px-10 py-5 rounded-full text-lg font-bold inline-block"
          >
            <span className="flex items-center gap-2">
              {user ? "Back to Dashboard" : "Start for Free"}
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-surface-border px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-text-muted text-sm gap-4">
          <div className="flex items-center gap-2">
            <NovaLogo size={16} />
            <span className="font-logo tracking-wider text-xs uppercase">
              Nova AI
            </span>
            <span className="opacity-50">
              © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6 font-medium tracking-wider uppercase text-xs">
            <Link
              href="#"
              className="hover:text-foreground transition-colors duration-300"
            >
              Twitter
            </Link>
            <Link
              href="#"
              className="hover:text-foreground transition-colors duration-300"
            >
              GitHub
            </Link>
            <Link
              href="#"
              className="hover:text-foreground transition-colors duration-300"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
