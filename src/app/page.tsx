import Link from "next/link";
import { Sparkles, Image as ImageIcon, Layout, ArrowRight, Code } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-brand-primary" />
          <span className="font-logo text-2xl font-bold tracking-tight uppercase">NOVA AI</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-semibold tracking-wide uppercase">
          <Link href="#features" className="hover:text-black/60 transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-black/60 transition-colors">Pricing</Link>
          <Link href="#about" className="hover:text-black/60 transition-colors">About</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold hidden sm:block hover:text-black/60 transition-colors uppercase">
            Log In
          </Link>
          <button className="bg-brand-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-primary-hover transition-all active:scale-95 duration-200">
            Start Creating
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center mt-20 md:mt-32 max-w-5xl mx-auto">
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-none font-bold text-foreground">
          DESIGN<br/>
          <span className="italic font-light">REIMAGINED.</span>
        </h1>
        
        <p className="mt-8 text-lg md:text-xl max-w-2xl text-foreground/80 font-sans leading-relaxed">
          The premium AI studio for creators. Generate breathtaking assets, build immersive product configurators, and export seamless code instantly.
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <button className="w-full sm:w-auto bg-brand-primary text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-brand-primary-hover transition-all flex items-center justify-center gap-2 group shadow-xl shadow-black/10 active:scale-95 duration-200">
            Try Nova AI Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full sm:w-auto bg-transparent text-brand-primary px-8 py-4 rounded-full text-base font-semibold border-2 border-brand-primary hover:bg-black/5 transition-all flex items-center justify-center gap-2 active:scale-95 duration-200">
            <Layout className="w-5 h-5" />
            View Gallery
          </button>
        </div>
      </main>

      {/* Value Patter Divider */}
      <div className="w-full overflow-hidden whitespace-nowrap bg-brand-primary text-white py-4 mt-32 md:mt-48 rotate-1 scale-105 shadow-2xl">
        <div className="inline-block animate-[scroll_20s_linear_infinite] font-logo text-xl tracking-widest font-bold">
          <span className="mx-8">•</span> HIGH QUALITY AI <span className="mx-8">•</span> SEAMLESS INTEGRATION <span className="mx-8">•</span> RAPID PROTOTYPING <span className="mx-8">•</span> PRODUCTION READY <span className="mx-8">•</span> HIGH QUALITY AI <span className="mx-8">•</span> SEAMLESS INTEGRATION <span className="mx-8">•</span> RAPID PROTOTYPING <span className="mx-8">•</span> PRODUCTION READY
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">The Ultimate Toolkit</h2>
            <p className="mt-4 text-foreground/70 max-w-md">Everything you need to go from concept to production in minutes, not days.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-3xl border border-black/5 hover:border-black/20 hover:shadow-xl transition-all group duration-300">
            <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mb-6 text-brand-primary group-hover:scale-110 transition-transform">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-display mb-3">AI Image Generation</h3>
            <p className="text-foreground/70 leading-relaxed text-sm">
              Powered by advanced generative models. Create stunning, high-resolution visuals tailored precisely to your brand guidelines.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-3xl border border-black/5 hover:border-black/20 hover:shadow-xl transition-all group duration-300">
            <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mb-6 text-brand-primary group-hover:scale-110 transition-transform">
              <Layout className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-display mb-3">Product Configurators</h3>
            <p className="text-foreground/70 leading-relaxed text-sm">
              Build interactive 3D and 2D product viewers instantly. Allow your users to customize with unparalleled realism.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-3xl border border-black/5 hover:border-black/20 hover:shadow-xl transition-all group duration-300">
            <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mb-6 text-brand-primary group-hover:scale-110 transition-transform">
              <Code className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-display mb-3">Seamless Export</h3>
            <p className="text-foreground/70 leading-relaxed text-sm">
              Generate production-ready React, Vue, or vanilla web code. Export directly to your favorite frameworks in one click.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="bg-brand-primary text-white py-32 px-6 mt-16 text-center rounded-t-[3rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.1)] mx-2">
        <h2 className="font-display text-5xl md:text-7xl font-bold mb-8">Ready to build?</h2>
        <p className="text-white/70 max-w-xl mx-auto mb-12 text-lg">
          Join thousands of designers and developers pushing the boundaries of what is possible on the web.
        </p>
        <button className="bg-white text-brand-primary px-10 py-5 rounded-full text-lg font-bold hover:bg-gray-100 transition-colors shadow-xl active:scale-95 duration-200">
          Get Started For Free
        </button>
        
        <div className="mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-white/50 text-sm max-w-6xl mx-auto">
          <p>© 2026 Nova AI Studio. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 font-semibold tracking-wider uppercase text-xs">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </section>

      {/* Internal style for the marquee animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
}
