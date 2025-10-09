import { SignedIn, UserButton } from "@clerk/nextjs";
import InviteForm from "@/components/invite-form";

export default function Dashboard() {
  return (
    <>
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">Hello World</h1>
        <InviteForm />
      </div>
    </>
  );
}
