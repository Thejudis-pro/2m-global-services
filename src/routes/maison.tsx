import { createFileRoute, redirect } from "@tanstack/react-router";

// "Maison" is the former name of the À propos page — keep old links working (permanent redirect).
export const Route = createFileRoute("/maison")({
  beforeLoad: () => {
    throw redirect({ to: "/a-propos", statusCode: 301 });
  },
});
