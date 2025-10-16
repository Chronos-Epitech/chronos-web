"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {logoPath} from "@/lib/config"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"

// Default image path: place your file at `public/images/Copilot_20251014_102800.png`
// so it is served at '/images/Copilot_20251014_102800.png'.

// SmartAvatar: tries a list of candidate `src` URLs in order and falls back to AvatarFallback on error
function SmartAvatar({ src, fallback }: { src?: string; fallback?: React.ReactNode }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const candidates: string[] = []
    if (src) candidates.push(src)
    // try with leading slash if missing
    if (src && !src.startsWith("/")) candidates.push("/" + src)
    // finally try default image
    candidates.push(logoPath)

    let mounted = true

    ;(async () => {
      for (const url of candidates) {
        try {
          await new Promise<void>((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve()
            img.onerror = () => reject()
            img.src = url
          })
          if (!mounted) return
          setSelected(url)
          setLoading(false)
          return
        } catch {
          // try next
        }
      }
      if (mounted) {
        setSelected(null)
        setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [src])

  if (loading)
    return (
      <AvatarFallback className="flex items-center justify-center w-full h-full">
        {fallback}
      </AvatarFallback>
    )

  return selected ? (
    <AvatarImage src={selected} className="w-full h-full object-cover" />
  ) : (
    <AvatarFallback className="flex items-center justify-center w-full h-full">{fallback}</AvatarFallback>
  )
}


function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "w-1/3 max-w-64 h-auto py-2 items-center justify-center bg-card text-card-foreground flex flex-wrap rounded-xl border shadow-sm place-content-center",
        className
      )}
      {...props}
    />
  )
}

function CardAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-avatar"
      className={cn(
        "p-2 w-full h-1/3 sm:w-1/3 sm:h-full content-center flex items-center justify-center",
        className
      )}
      {...props}
    />
  )
}

function CardFirstName({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-name"
            className={cn("", className)}
            {...props}
        />
    )
}

function CardLastName({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-name"
            className={cn("", className)}
            {...props}
        />
    )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex-row p-2 center place-content-center", className)}
      {...props}
    />
  )
}
type ProfileCardProps = {
  avatar ?: string;
  image ?: string ;
    avatarFallback ?: string;
    firstName: string;
    lastName: string;
};

function ProfileCard({ ...props }: ProfileCardProps) {
    return (
        <Card className="w-64 h-36 p-6 items-center justify-center sm:w-64 sm:h-36 sm:p-6 bg-card text-card-foreground flex flex-wrap rounded-xl border shadow-sm place-content-center">
      <CardAvatar className="p-0 h-full w-1/3 sm:w-1/3 sm:h-full">
        <Avatar>
          <SmartAvatar src={props.image ?? props.avatar ?? logoPath} fallback={props.avatarFallback} />
        </Avatar>
      </CardAvatar>
            <CardContent>
                <CardLastName className="w-full font-bold sm:w-full sm:text-left text-sm place-content-center">{props.lastName}</CardLastName>
                <CardFirstName className="w-full sm:w-full sm:text-left text-sm place-content-center">{props.firstName}</CardFirstName>
            </CardContent>
        </Card>
    )
}

function SmallProfileCard({ ...props }: ProfileCardProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const firstItemRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("click", onDoc)
    return () => document.removeEventListener("click", onDoc)
  }, [])

  useEffect(() => {
    if (open) {
      // focus first menu item for keyboard users
      firstItemRef.current?.focus()
    }
  }, [open])

  return (
<div>
            <button
                    aria-haspopup="true"
                    aria-expanded={open}
                    onClick={() => setOpen((s) => !s)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault()
                        setOpen(true)
                      }
                    }}
                    className="focus:outline-none"
                >
    <Card className="z-50 m-2 w-12 h-12 sm:w-fit sm:max-w-100 sm:h-fit py-1 flex-row items-center justify-center sm:p-1 bg-card text-card-foreground flex rounded-full sm:rounded-xl border shadow-sm place-content-center transition-transform transform-gpu hover:scale-105 overflow-hidden">

        <CardAvatar className="p-0 sm:w-14 flex items-center justify-center h-full overflow-hidden min-w-0">
          {/* Avatar wrapper should not apply object-cover; center via the image itself */}
          <Avatar className="rounded-full overflow-hidden h-10 w-10 sm:h-14 sm:w-14 object-cover flex-shrink-0 block">
            <SmartAvatar src={props.image ?? props.avatar ?? logoPath} fallback={props.avatarFallback} />
          </Avatar>
        </CardAvatar>
        

        <CardContent className="hidden sm:block">
          <CardLastName className="w-full font-bold sm:w-full sm:text-left text-sm place-content-center">{props.lastName}</CardLastName>
          <CardFirstName className="w-full sm:w-full sm:text-left text-sm place-content-center">{props.firstName}</CardFirstName>
        </CardContent>

     
    </Card>
      </button> 

      {open && (
  <div
    onMouseEnter={() => setOpen(true)}
    onMouseLeave={() => {
  setTimeout(() => setOpen(false), 200); // délai de 200ms
}}
    className="absolute right-2 z-50"
  >
    <div
      role="menu"
      aria-orientation="vertical"
      className="w-40 bg-card border rounded-md shadow-md ring-1 ring-black/5 animate-in fade-in-0 duration-150"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <Link
        href="/profile"
        role="menuitem"
        ref={firstItemRef}
        tabIndex={0}
        className="block px-3 py-2 text-sm hover:bg-card-foreground/10 focus:bg-card-foreground/20 outline-none"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        Edit profile
      </Link>
    </div>
  </div>
)}       
    </div>
  )
}

export { Card, CardAvatar, CardContent, CardFirstName, CardLastName, ProfileCard, SmallProfileCard }
