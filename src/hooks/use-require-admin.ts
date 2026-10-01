import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

function isAdmin(user: User | null): boolean {
  return user?.app_metadata?.role === "admin";
}

export function useRequireAdmin() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;

    async function check() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!isAdmin(data.user)) {
        toast.error("Accès réservé aux administrateurs.");
        navigate({ to: "/admin/connexion" });
        return;
      }
      setUser(data.user);
      setChecked(true);
    }

    check();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isAdmin(session?.user ?? null)) {
        navigate({ to: "/admin/connexion" });
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [navigate]);

  return { checked, user };
}
