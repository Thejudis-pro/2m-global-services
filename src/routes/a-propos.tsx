import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos | Techno Office Sarl" },
      {
        name: "description",
        content:
          "Découvrez Techno Office Sarl : notre histoire, notre mission et notre équipe à Dakar, Sénégal.",
      },
    ],
  }),
  component: AboutPage,
});

const TEAM_SLOTS = [1, 2, 3];

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">À propos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Techno Office Sarl — distributeur de mobilier de bureau et de maison à Dakar, Sénégal.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground">Notre histoire</h2>
        <div className="mt-3 rounded-lg border border-dashed border-border bg-secondary/30 p-4">
          <p className="text-sm italic text-muted-foreground">
            [Insérer l'histoire réelle de l'entreprise ici — année de création, fondateurs, et
            évolution de Techno Office Sarl à Dakar.]
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground">Notre mission</h2>
        <div className="mt-3 rounded-lg border border-dashed border-border bg-secondary/30 p-4">
          <p className="text-sm italic text-muted-foreground">
            [Insérer l'énoncé de mission réel de Techno Office Sarl ici.]
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground">Notre équipe</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {TEAM_SLOTS.map((slot) => (
            <div
              key={slot}
              className="flex flex-col items-center rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <User className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm italic text-muted-foreground">
                [Nom du membre de l'équipe]
              </p>
              <p className="text-xs italic text-muted-foreground">[Poste à renseigner]</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Photos et biographies de l'équipe à ajouter.
        </p>
      </section>
    </div>
  );
}
