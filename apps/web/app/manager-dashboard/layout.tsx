import Logo from "@chronos/web/components/ui/logo";
import "../globals.css";
import { SmallProfileCard } from "@chronos/web/components/ui/profile-card";
import { Separator } from "@radix-ui/react-select";
import { HeaderTitle } from "@chronos/web/components/ui/header-title";

export default function ManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Root `app/layout.tsx` already renders <html> and <body> and sets fonts.
  // Nested layouts must not render html/body — use a wrapper element instead.
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-between">
        <Logo />
        <HeaderTitle
          title="Manager Dashboard"
          className="absolute left-1/2 transform -translate-x-1/2"
        />
        <SmallProfileCard firstName="John" lastName="Doe" />
      </div>
      <Separator className="border-b" />

      <main className="flex-1">{children}</main>
    </div>
  );
}
