"use client";

import { Button } from "@/components/ui/button";  
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <Link href="/Accueil">
      <Button variant="secondary" className="cursor-pointer">Click me</Button>
      </Link>
    </div>
  );
}
