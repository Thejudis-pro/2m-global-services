import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authStore, type PublicUser } from "@/lib/auth-store";

export function useRequireAdmin() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    const current = authStore.getCurrentUser();
    if (!current || current.role !== "admin") {
      toast.error("Accès réservé aux administrateurs.");
      navigate({ to: "/admin/connexion" });
      return;
    }
    setUser(current);
    setChecked(true);
  }, [navigate]);

  return { checked, user };
}
