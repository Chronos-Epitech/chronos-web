"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

export default function MathisPage() {
    const [showCard, setShowCard] = useState(false);

    return (
        <div className="relative h-screen w-full">

            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
                style={{ backgroundImage: "url('/Background.jpg')" }}
            ></div>

            <Link href="/" className="absolute top-4 left-4 z-20">
                <Button variant="ghost" className="cursor-pointer">
                    Acceuil
                </Button>
            </Link>

            <Button
                variant="ghost"
                className="cursor-pointer absolute top-4 right-4 z-20"
                onClick={() => setShowCard(!showCard)}>
                    log in
            </Button>

            <div className="relative z-10 flex flex-col items-center justify-center h-full text-black space-y-2">
                <h1 className="text-6xl font-bold">CHRONOS</h1>
                <p className="text-1xl font-bold">Manage your time like a pro</p>
            </div>


            {showCard && (
                <div className="absolute inset-0 flex items-center justify-center z-50">

                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowCard(false)}
                    ></div>


                    <div className="relative z-10">
                        <Card className="w-[350px]">
                            <CardHeader>
                                <CardTitle className ="w-full max-w-sm">Login to your account</CardTitle>

                                <CardAction><Button variant="link">Sign up</Button></CardAction>
                            </CardHeader>
                            <CardContent>
                           <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
