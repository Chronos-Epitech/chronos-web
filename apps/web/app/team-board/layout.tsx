import Logo from "@/components/ui/logo";
import "../globals.css";
import { SmallProfileCard } from "@/components/ui/profile-card";
import { Separator } from "@/components/ui/separator";
import { HeaderTitle } from "@/components/ui/header-title";
import { trpc } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import type { Tables } from "@chronos/types";

export default async function ManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userProfile: Tables<"users"> | null = null;

  // Récupération du profil utilisateur depuis Supabase
  try {
    userProfile = await trpc.user.me.query();
    console.log("User profile récupéré:", userProfile);
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.code === "UNAUTHORIZED") {
        console.error("Utilisateur non authentifié");
      } else if (error.code === "FORBIDDEN") {
        console.error("Accès interdit");
      } else {
        console.error(
          "Erreur lors de la récupération du profil:",
          error.message,
        );
      }
    } else {
      console.error("Erreur inattendue:", error);
    }
  }

  // Récupération des données utilisateur depuis Supabase
  const firstName = userProfile?.first_name ?? "Prénom";
  const lastName = userProfile?.last_name ?? "Nom";

  // Root `app/layout.tsx` already renders <html> and <body> and sets fonts.
  // Nested layouts must not render html/body — use a wrapper element instead.
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-row items-center justify-between">
        <Logo />
        <HeaderTitle
          title="Mon équipe"
          className="absolute left-1/2 transform -translate-x-1/2"
        />
        <SmallProfileCard firstName={firstName} lastName={lastName} />
      </div>
      <Separator className="border-b p-1" />
      <main className="flex-1 h-full">{children}</main>
    </div>
  );
}
