"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SendInvitationInput } from "@chronos/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/buttons/button";
import { Input } from "@/components/ui/elements/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/elements/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/elements/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms/form";
import { UserPlus } from "lucide-react";
import { useTrpcClient } from "@/trpc/client";

interface InviteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteSheet({ open, onOpenChange }: InviteSheetProps) {
  const trpc = useTrpcClient();
  const form = useForm<z.infer<typeof SendInvitationInput>>({
    resolver: zodResolver(SendInvitationInput),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const handleSubmit = async (data: z.infer<typeof SendInvitationInput>) => {
    try {
      await trpc.invitation.send.mutate(data);
      toast.success("Invitation envoyée", {
        description: `Une invitation a été envoyée à ${data.email}`,
      });
      form.reset({ email: "", role: "member" });
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de l'envoi";
      toast.error("Erreur", {
        description: errorMessage,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-6">
        <SheetHeader className="mb-6">
          <SheetTitle>Envoyer une invitation</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

interface InviteSheetTriggerProps {
  onOpenChange: (open: boolean) => void;
}

export function InviteSheetTrigger({ onOpenChange }: InviteSheetTriggerProps) {
  return (
    <Button size="sm" className="gap-2" onClick={() => onOpenChange(true)}>
      <UserPlus className="h-4 w-4" />
      Inviter
    </Button>
  );
}
