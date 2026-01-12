import { LogOut, User, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-sm">
      {/* Left side - can add breadcrumbs or search */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            バックオフィスSaaS
          </p>
        </div>
      </div>
      
      {/* Right side - user controls */}
      <div className="flex items-center gap-2">
        {/* Notifications placeholder */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
        </Button>
        
        {/* Settings placeholder */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        {/* Divider */}
        <div className="mx-2 h-6 w-px bg-border" />
        
        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 rounded-full bg-accent/50 py-1.5 pl-1.5 pr-4 transition-colors hover:bg-accent">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[13px] font-medium text-foreground/80">
              {user.email?.split("@")[0]}
            </span>
          </div>
        )}
        
        {/* Logout */}
        <form action={signOut}>
          <Button 
            variant="ghost" 
            size="sm" 
            type="submit"
            className="h-8 gap-2 text-[12px] text-muted-foreground transition-colors hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">ログアウト</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
