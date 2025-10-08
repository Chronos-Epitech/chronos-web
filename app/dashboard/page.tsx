"use client";

import { Button } from "@/components/ui/button";
import {
  SignedIn,
  UserButton,
} from "@clerk/nextjs";

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
        <Button variant="secondary" className="cursor-pointer">
          Click me
        </Button>
      </div>
    </>
  );
}
