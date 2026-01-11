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
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div>
        <h1 className="text-sm font-medium text-muted-foreground">
          バックオフィスSaaS選定支援
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
        )}
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </form>
      </div>
    </header>
  );
}
