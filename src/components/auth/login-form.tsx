"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "確認メールを送信しました。メール内のリンクをクリックしてログインしてください。",
        });
        setEmail("");
      }
    } catch {
      setMessage({ type: "error", text: "予期しないエラーが発生しました。" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        setIsGoogleLoading(false);
      }
      // 成功時はリダイレクトされるのでローディング状態を維持
    } catch {
      setMessage({ type: "error", text: "Google認証中にエラーが発生しました。" });
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[420px] border-border/40 bg-card/80 shadow-2xl shadow-black/5 backdrop-blur-sm">
      <CardHeader className="space-y-3 pb-6 pt-8 text-center">
        <CardTitle className="text-xl font-semibold tracking-tight">
          ログイン
        </CardTitle>
        <CardDescription className="text-[13px]">
          メールアドレスまたはGoogleでログイン
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        {/* Google Login - Primary action */}
        <Button
          type="button"
          variant="outline"
          className="mb-6 h-11 w-full gap-3 border-border/60 bg-background text-[14px] font-medium shadow-sm transition-all hover:border-border hover:bg-accent hover:shadow"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>接続中...</span>
            </>
          ) : (
            <>
              <GoogleIcon className="h-4 w-4" />
              <span>Googleでログイン</span>
            </>
          )}
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
              または
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[13px] font-medium">
              メールアドレス
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 border-border/60 bg-background pl-10 text-[14px] shadow-sm transition-all placeholder:text-muted-foreground/40 focus:border-primary focus:shadow"
              />
            </div>
          </div>
          
          {message && (
            <div
              className={`flex items-start gap-3 rounded-lg p-4 text-[13px] ${
                message.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span className="leading-relaxed">{message.text}</span>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="h-11 w-full gap-2 text-[14px] font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>送信中...</span>
              </>
            ) : (
              <>
                <span>マジックリンクを送信</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
