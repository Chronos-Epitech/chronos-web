"use client";

import * as React from "react";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function HomePage() {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center">
      <Image
        width={96}
        height={51.5}
        src="/logo.png"
        alt="logo"
        className="object-cover"
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-black gap-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-6xl font-bold">CHRONOS</h1>
          <p className="text-1xl font-bold">Manage your time like a pro</p>
        </div>
        <SignedOut>
          <SignInButton>
            <Button size="lg" className="cursor-pointer">
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Button
            size="lg"
            className="cursor-pointer"
            onClick={() => redirect("/dashboard")}
          >
            Go to dashboard
          </Button>
        </SignedIn>
      </div>
    </div>
  );
}
