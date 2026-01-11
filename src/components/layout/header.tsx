import { LogOut, User } from "lucide-react";
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
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div />
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[13px] text-muted-foreground">{user.email}</span>
          </div>
        )}
        <form action={signOut}>
          <Button 
            variant="ghost" 
            size="sm" 
            type="submit"
            className="h-8 gap-2 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            ログアウト
          </Button>
        </form>
      </div>
    </header>
  );
}
