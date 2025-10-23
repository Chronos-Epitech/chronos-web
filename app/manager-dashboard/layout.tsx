import Logo from "@/components/ui/logo";
import "../globals.css";
import { SmallProfileCard } from "@/components/ui/profile-card";
import { Separator } from "@/components/ui/separator";
import {HeaderTitle} from "@/components/ui/header-title";

export default function ManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Root `app/layout.tsx` already renders <html> and <body> and sets fonts.
  // Nested layouts must not render html/body — use a wrapper element instead.
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-row items-center justify-between">
        <Logo />
        <HeaderTitle title="Manager Dashboard" className="absolute left-1/2 transform -translate-x-1/2" />
        <SmallProfileCard
          firstName="User Name"
          lastName="User Last Name"
        />
      </div>
      <Separator className="border-b p-1" />
      <main className="flex-1 h-full">{children}</main>
    </div>
  );
}
