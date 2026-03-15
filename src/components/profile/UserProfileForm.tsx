"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";

interface UserProfileFormProps {
  initialFullName: string;
  initialPreferences: any;
}

export default function UserProfileForm({
  initialFullName,
  initialPreferences,
}: UserProfileFormProps) {
  const supabase = createClient();
  const [fullName, setFullName] = useState(initialFullName || "");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState(initialPreferences?.theme || "dark");
  const [responseStyle, setResponseStyle] = useState(
    initialPreferences?.response_style || "concise"
  );
  const [voice, setVoice] = useState(
    initialPreferences?.voice || "Matthew"
  );
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Update auth password if provided
      if (password) {
        const { error: pwdError } = await supabase.auth.updateUser({
          password,
        });
        if (pwdError) throw pwdError;
      }

      // 2. Update profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const preferences = { theme, response_style: responseStyle, voice };

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          preferences,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      setMessage({ type: "success", text: "Profile updated successfully." });
      setPassword(""); // clear password field after successful update
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm border ${
          message.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      {/* Account Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Account</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-foreground placeholder:text-text-muted text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              New Password <span className="text-xs font-normal">(leave blank to keep current)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-foreground placeholder:text-text-muted text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
        </div>
      </div>

      <hr className="border-surface-border" />

      {/* AI Preferences */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Nova AI Preferences</h3>
        <p className="text-sm text-text-muted mb-4">
          Customize how Nova AI responds to your messages. These settings are passed to the model on every request.
        </p>
        <div className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-text-muted mb-1.5">
              Response Style
            </label>
            <select
              value={responseStyle}
              onChange={(e) => setResponseStyle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-foreground text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all appearance-none"
            >
              <option value="concise">Concise & Direct (Default)</option>
              <option value="detailed">Detailed & Explanatory</option>
              <option value="creative">Creative & Enthusiastic</option>
              <option value="professional">Strictly Professional</option>
            </select>
          </div>
          
          <div>
             <label className="block text-sm font-medium text-text-muted mb-1.5">
              App Theme <span className="text-xs font-normal">(Currently dark mode only)</span>
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-surface/50 border border-surface-border text-text-muted text-sm cursor-not-allowed appearance-none"
            >
              <option value="dark">Dark Theme</option>
            </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-text-muted mb-1.5">
              AI Voice (AWS Polly)
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-foreground text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all appearance-none"
            >
              <optgroup label="Male Voices">
                <option value="Matthew">Matthew (Default, American)</option>
                <option value="Stephen">Stephen (American)</option>
                <option value="Justin">Justin (American)</option>
                <option value="Arthur">Arthur (British)</option>
              </optgroup>
              <optgroup label="Female Voices">
                <option value="Joanna">Joanna (American)</option>
                <option value="Salli">Salli (American)</option>
                <option value="Kendra">Kendra (American)</option>
                <option value="Ruth">Ruth (American)</option>
                <option value="Amy">Amy (British)</option>
                <option value="Emma">Emma (British)</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-accent w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-8"
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Save Changes
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </span>
      </button>
    </form>
  );
}
