"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Constants } from "@/lib/supabase/supabase-types";

const roles = Constants.public.Enums.role;

const FormSchema = z.object({
  email: z.email().nonempty({
    message: "Please enter an email.",
  }),
  role: z.enum(roles),
});

export default function InviteForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setFormError(null);
    setFormSuccess(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Request failed");
      }
      setFormSuccess(true);
      form.reset({ email: "", role: "member" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-xs">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
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
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          variant="secondary"
          className="cursor-pointer"
          disabled={submitting}
        >
          {submitting ? "Sending..." : "Send invitation"}
        </Button>
        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        {formSuccess && (
          <p className="text-green-600 text-sm">Invitation sent.</p>
        )}
      </form>
    </Form>
  );
}
