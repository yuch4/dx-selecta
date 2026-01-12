import { LoginForm } from "@/components/auth/login-form";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-accent/30 to-primary/5 p-4">
      {/* Background decorative elements */}
      <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-accent/40 to-transparent blur-3xl" />
      <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/10 to-transparent blur-3xl" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo badge */}
        <div className="mb-8 flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/25">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-primary to-primary/60 opacity-0 blur-md transition-opacity hover:opacity-40" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">DX Selecta</span>
            <span className="text-[11px] font-medium text-muted-foreground">SaaS選定支援</span>
          </div>
        </div>
        
        <LoginForm />
        
        {/* Footer note */}
        <p className="mt-8 text-center text-[11px] text-muted-foreground/60">
          バックオフィスSaaS選定から稟議まで一気通貫
        </p>
      </div>
    </div>
  );
}
