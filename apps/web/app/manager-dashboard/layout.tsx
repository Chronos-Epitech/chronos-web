import Logo from "@chronos/web/components/ui/logo";
import "../globals.css";
<<<<<<< HEAD:app/manager-dashboard/layout.tsx
import { SmallProfileCard } from "@/components/ui/profile-card";
import { Separator } from "@/components/ui/separator";
import {HeaderTitle} from "@/components/ui/header-title";
=======
import { SmallProfileCard } from "@chronos/web/components/ui/profile-card";
import { Separator } from "@radix-ui/react-select";
import { HeaderTitle } from "@chronos/web/components/ui/header-title";
>>>>>>> bd7eec6778115a578d0b8e5131598b6ab74588da:apps/web/app/manager-dashboard/layout.tsx

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
        <HeaderTitle
          title="Manager Dashboard"
          className="absolute left-1/2 transform -translate-x-1/2"
        />
        <SmallProfileCard firstName="John" lastName="Doe" />
      </div>
<<<<<<< HEAD:app/manager-dashboard/layout.tsx
      <Separator className="border-b p-1" />
      <main className="flex-1 h-full">{children}</main>
=======
      <Separator className="border-b" />

      <main className="flex-1">{children}</main>
>>>>>>> bd7eec6778115a578d0b8e5131598b6ab74588da:apps/web/app/manager-dashboard/layout.tsx
    </div>
  );
}
