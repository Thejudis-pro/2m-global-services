import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { authStore, type PublicUser } from "@/lib/auth-store";
import { SENEGAL_REGIONS, isValidSenegalPhone } from "@/lib/senegal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Le nom complet est requis."),
  phone: z
    .string()
    .trim()
    .min(1, "Le numéro de téléphone est requis.")
    .refine(isValidSenegalPhone, "Numéro sénégalais invalide (ex : 77 123 45 67)."),
});

const addressSchema = z.object({
  label: z.string().trim().min(2, "Veuillez nommer cette adresse."),
  address: z.string().trim().min(5, "L'adresse est requise."),
  city: z.string().trim().min(2, "La ville est requise."),
  region: z.string().min(1, "Veuillez choisir une région."),
});

export const Route = createFileRoute("/compte/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil | 2M Global Services" },
      {
        name: "description",
        content: "Gérez vos informations personnelles et vos adresses de livraison.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const [addrLabel, setAddrLabel] = useState("");
  const [addrAddress, setAddrAddress] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrRegion, setAddrRegion] = useState("");
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const current = authStore.getCurrentUser();
    if (!current) {
      navigate({ to: "/compte/connexion", search: { redirect: "/compte/profil" } });
      return;
    }
    setUser(current);
    setName(current.name);
    setPhone(current.phone);
    setChecked(true);
  }, [navigate]);

  if (!checked || !user) {
    return <div className="mx-auto max-w-3xl px-4 py-16 md:px-6" aria-hidden="true" />;
  }

  function refreshUser() {
    setUser(authStore.getCurrentUser());
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse({ name, phone });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setProfileErrors(nextErrors);
      return;
    }
    setProfileErrors({});
    authStore.updateProfile(user!.id, parsed.data);
    refreshUser();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    const parsed = addressSchema.safeParse({
      label: addrLabel,
      address: addrAddress,
      city: addrCity,
      region: addrRegion,
    });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setAddrErrors(nextErrors);
      return;
    }
    setAddrErrors({});
    authStore.addAddress(user!.id, parsed.data);
    refreshUser();
    setAddrLabel("");
    setAddrAddress("");
    setAddrCity("");
    setAddrRegion("");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">Mon profil</h1>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Informations personnelles</h2>
        <form onSubmit={handleProfileSubmit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(profileErrors.name)}
              aria-describedby="name-error"
            />
            <p id="name-error" role="alert" className="mt-1 min-h-[1rem] text-xs text-destructive">
              {profileErrors.name}
            </p>
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={Boolean(profileErrors.phone)}
              aria-describedby="phone-error"
            />
            <p id="phone-error" role="alert" className="mt-1 min-h-[1rem] text-xs text-destructive">
              {profileErrors.phone}
            </p>
          </div>
          <div className="sm:col-span-2">
            <Label>E-mail</Label>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit">Enregistrer</Button>
            {saved && (
              <span role="status" className="text-sm text-primary">
                Profil mis à jour.
              </span>
            )}
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground">Adresses de livraison</h2>
        {user.addresses.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Aucune adresse enregistrée pour le moment.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {user.addresses.map((addr) => (
              <li
                key={addr.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{addr.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {addr.address}, {addr.city} ({addr.region})
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Supprimer l'adresse ${addr.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer cette adresse ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        « {addr.label} » sera définitivement supprimée de votre compte.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          authStore.removeAddress(user!.id, addr.id);
                          refreshUser();
                        }}
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={handleAddAddress}
          noValidate
          className="mt-6 grid gap-4 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2"
        >
          <h3 className="text-sm font-semibold text-foreground sm:col-span-2">
            Ajouter une adresse
          </h3>
          <div>
            <Label htmlFor="addr-label">Nom de l'adresse</Label>
            <Input
              id="addr-label"
              placeholder="Domicile, Bureau..."
              value={addrLabel}
              onChange={(e) => setAddrLabel(e.target.value)}
              aria-invalid={Boolean(addrErrors.label)}
              aria-describedby="addr-label-error"
            />
            <p
              id="addr-label-error"
              role="alert"
              className="mt-1 min-h-[1rem] text-xs text-destructive"
            >
              {addrErrors.label}
            </p>
          </div>
          <div>
            <Label htmlFor="addr-city">Ville</Label>
            <Input
              id="addr-city"
              value={addrCity}
              onChange={(e) => setAddrCity(e.target.value)}
              aria-invalid={Boolean(addrErrors.city)}
              aria-describedby="addr-city-error"
            />
            <p
              id="addr-city-error"
              role="alert"
              className="mt-1 min-h-[1rem] text-xs text-destructive"
            >
              {addrErrors.city}
            </p>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="addr-address">Adresse</Label>
            <Textarea
              id="addr-address"
              value={addrAddress}
              onChange={(e) => setAddrAddress(e.target.value)}
              aria-invalid={Boolean(addrErrors.address)}
              aria-describedby="addr-address-error"
            />
            <p
              id="addr-address-error"
              role="alert"
              className="mt-1 min-h-[1rem] text-xs text-destructive"
            >
              {addrErrors.address}
            </p>
          </div>
          <div>
            <Label htmlFor="addr-region">Région</Label>
            <Select value={addrRegion} onValueChange={setAddrRegion}>
              <SelectTrigger
                id="addr-region"
                aria-invalid={Boolean(addrErrors.region)}
                aria-describedby="addr-region-error"
              >
                <SelectValue placeholder="Choisir une région" />
              </SelectTrigger>
              <SelectContent>
                {SENEGAL_REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p
              id="addr-region-error"
              role="alert"
              className="mt-1 min-h-[1rem] text-xs text-destructive"
            >
              {addrErrors.region}
            </p>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="outline">
              Ajouter l'adresse
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
