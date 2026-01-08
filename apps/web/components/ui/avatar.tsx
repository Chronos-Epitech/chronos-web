"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { useUser } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex aspect-square size-8 sm:size-10 ring-2 ring-border/60 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  src: srcProp,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  const { isLoaded, user } = useUser();
  const src = srcProp ?? (isLoaded ? user?.imageUrl : undefined);

  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("h-full w-full object-cover", className)}
      {...props}
      src={src}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
