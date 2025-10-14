import * as React from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"


function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "w-1/3 max-w-64 h-auto py-2 items-center justify-center sm:max-h-36 sm:h-1/3 sm:p-6 bg-card text-card-foreground flex flex-wrap rounded-xl border shadow-sm place-content-center",
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
        "p-2 w-full h-1/3 sm:w-1/3 sm:h-full object-cover content-center grid grid-rows-[auto_auto]* has-data-[slot=card-action]:grid-cols-[1fr_auto] place-content-center",
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
            className={cn("w-full text-center sm:w-full sm:text-left text-sm place-content-center", className)}
            {...props}
        />
    )
}

function CardLastName({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-name"
            className={cn("text-center sm:w-full sm:text-left text-sm font-bold place-content-center", className)}
            {...props}
        />
    )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex-row w-full h-2/3 sm:w-2/3 sm:h-full p-2 center place-content-center", className)}
      {...props}
    />
  )
}
type ProfileCardProps = {
    avatar ?: string;
    avatarFallback ?: string;
    firstName: string;
    lastName: string;
};

function ProfileCard({ ...props }: ProfileCardProps) {
    return (
        <Card className="w-1/3 max-w-64 h-auto py-2 items-center justify-center sm:max-h-36 sm:h-1/3 sm:p-6 bg-card text-card-foreground flex flex-wrap rounded-xl border shadow-sm place-content-center">
            <CardAvatar>
                <Avatar>
                    <AvatarImage src={props.avatar} />
                    <AvatarFallback>{props.avatarFallback}</AvatarFallback>
                </Avatar>
            </CardAvatar>
            <CardContent>
                <CardLastName>{props.lastName}</CardLastName>
                <CardFirstName>{props.firstName}</CardFirstName>
            </CardContent>
        </Card>
    )
}

function SmallProfileCard({ ...props }: ProfileCardProps) {
    return (
        <Card className="w-auto max-w-64 h-auto py-2 items-center justify-center sm:max-h-36 sm:h-1/3 sm:p-1 bg-card text-card-foreground flex flex-wrap rounded-xl border shadow-sm place-content-center">
            <CardAvatar className="p-1">
                <Avatar className="p-0">
                    <AvatarImage className="p-0" src={props.avatar} />
                    <AvatarFallback className="p-0">{props.avatarFallback}</AvatarFallback>
                </Avatar>
            </CardAvatar>
            <CardContent className="p-1 hidden sm:block place-content-center">
                <CardLastName className="p-0">{props.lastName}</CardLastName>
                <CardFirstName className="p-0">{props.firstName}</CardFirstName>
            </CardContent>
        </Card>
    )
}

export { Card, CardAvatar, CardContent, CardFirstName, CardLastName, ProfileCard, SmallProfileCard }
