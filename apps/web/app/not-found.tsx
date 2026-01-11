import Link from "next/link";
import { CircleQuestionMark } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/pages/empty";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleQuestionMark />
          </EmptyMedia>
          <EmptyTitle>Not Found</EmptyTitle>
          <EmptyDescription>Could not find requested resource</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/dashboard">Return to dashboard</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
