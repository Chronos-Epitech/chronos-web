"use client";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/squared-avatar";
import { SignedIn, UserButton, UserProfile } from "@clerk/nextjs";
import {
   Card, 
   CardContent,
  CardFooter,
  CardHeader,
  CardTitle, } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarWeek } from "@/components/ui/calendar-week";
import { toast } from "sonner";
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export const description = "An area chart with a legend"


const chartDataWeek = [
  { day: "Lun", Departure: 186, Arrival: 80 },
  { day: "Mar", Departure: 305, Arrival: 200 },
  { day: "Mer", Departure: 237, Arrival: 120 },
  { day: "Jeu", Departure: 73, Arrival: 190 },
  { day: "Ven", Departure: 209, Arrival: 130 },
  { day: "Sam", Departure: 214, Arrival: 140 },
  { day: "Dim", Departure: 150, Arrival: 90 },
]

const chartDataMonth = [
  { month: "January", Departure: 186, Arrival: 80 },
  { month: "February", Departure: 305, Arrival: 200 },
  { month: "March", Departure: 237, Arrival: 120 },
  { month: "April", Departure: 73, Arrival: 190 },
  { month: "May", Departure: 209, Arrival: 130 },
  { month: "June", Departure: 214, Arrival: 140 },
]
const chartConfig = {
  Departure: {
    label: "Departure",
    color: "#1e40af", // Bleu foncé
  },
  Arrival: {
    label: "Arrival", 
    color: "#3b82f6", // Bleu plus clair
  },
} satisfies ChartConfig

export default function Dashboard() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [mode, setMode] = React.useState<"week" | "month">("week");
  const [showUserProfile, setShowUserProfile] = React.useState(false);

  return (
    <div className="relative min-h-screen w-full">

      {/* Header */}
      <div className="w-full h-20 bg-white px-4 sm:px-8 border-b border-gray-200 flex items-center justify-between fixed top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="icon.png" alt="logo" className="w-12 h-12 sm:w-16 sm:h-16 object-cover" />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">CHRONOS</h1>
            <p className="text-xs sm:text-sm font-medium">Manage your time like a pro</p>
          </div>
        </div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      {/* Content */}
      <div className="pt-24 flex flex-col gap-4 sm:flex-row sm:gap-8 px-4 sm:px-8 sm:h-full">

        {/* left screen */}
        <div className="flex flex-col gap-4 sm:gap-2 w-full sm:w-1/3">

          {/* User Card */}
          <Card className="flex flex-col gap-2 p-4 relative">
            <div className="flex flex-col gap-1">
              <Label className="text-sm sm:text-base">Last Name:</Label>
              <Label className="text-sm sm:text-base">First Name:</Label>
              <div className="flex justify-start mt-2">
                <Button 
                  variant="secondary" 
                  className="w-auto px-4 py-2 text-sm sm:text-base mt-3"
                  onClick={() => setShowUserProfile(true)}
                >
                  Changes
                </Button>
              </div>
            </div>
            <Avatar className="h-full w-1/4 sm:w-1/4 absolute right-0 bottom-0">
              <AvatarImage src="id.png" alt="User Avatar" className="object-cover" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Card>

          {/* Card Schedules */}
          <Card className="flex flex-row sm:flex-row items-center justify-center gap-2 sm:gap-6 p-4">
            <Button
              variant="outline"
              className="flex-1 min-w-[80px] max-w-[200px] h-32 px-4 py-2"
              onClick={() => {
                const now = new Date();
                toast("Arrival saved at:", {
                  description: now.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }),
                  action: { label: "Undo", onClick: () => console.log("Undo") },
                });
              }}
            >
              ARRIVAL
            </Button>
            <div className="sm:flex items-center text-lg font-medium">-</div>
            <Button
              variant="outline"
              className="flex-1 min-w-[80px] max-w-[200px] h-32 px-4 py-2"
              onClick={() => {
                const now = new Date();
                toast("Departure saved at:", {
                  description: now.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }),
                  action: { label: "Undo", onClick: () => console.log("Undo") },
                });
              }}
            >
              DEPARTURE
            </Button>
          </Card>
{/* Area Chart */}
          <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Charts - {mode === "week" ? "Last Week" : "Last Months"}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                {mode === "week" ? "Semaine" : "Mois"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setMode("week")}>Semaine</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode("month")}>Mois</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={mode === "week" ? chartDataWeek : chartDataMonth}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={mode === "week" ? "day" : "month"}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => mode === "week" ? value : value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="Arrival"
              type="natural"
              fill="#3b82f6"
              fillOpacity={0.4}
              stroke="var(--color-Arrival)"
              stackId="a"
            />
            <Area
              dataKey="Departure"
              type="natural"
              fill="var(--color-Departure)"
              fillOpacity={0.4}
              stroke="var(--color-Departure)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>

        </div>

        {/* right screen*/}
        <div className="w-full sm:w-2/3 flex flex-col mt-4 sm:mt-0">
          {/* Calendar */}
          {mode === "week" ? (
            <CalendarWeek
              selectedDate={date}
              onSelect={setDate}
              className="rounded-lg border w-full bg-white"
              mode={mode}
              onModeChange={setMode}
            />
          ) : (
            <Calendar
              selectedDate={date}
              onSelect={setDate}
              className="rounded-lg border w-full h-[680] bg-white"
              mode={mode}
              onModeChange={setMode}
            />
          )}
        </div>

      </div>

      {/* UserProfile Modal avec effet de flou qui épouse la forme */}
      {showUserProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop avec effet de flou adaptatif */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-md"
            onClick={() => setShowUserProfile(false)}
          />
          
          {/* UserProfile de Clerk avec forme arrondie */}
          <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <UserProfile 
              routing="hash"
              appearance={{
                elements: {
                  rootBox: "w-full h-full rounded-2xl",
                  card: "shadow-none border-0 rounded-2xl overflow-hidden bg-white",
                  modalContent: "p-0 m-0 rounded-2xl",
                  modalHeader: "p-0 m-0 rounded-t-2xl",
                  modalBody: "p-0 m-0",
                  modalFooter: "p-0 m-0 rounded-b-2xl",
                  navbar: "rounded-t-2xl",
                  navbarButton: "hover:bg-gray-100 rounded-md",
                  headerTitle: "text-xl font-semibold",
                  headerSubtitle: "text-gray-600",
                  profileSectionTitle: "text-lg font-medium",
                  formFieldLabel: "text-sm font-medium text-gray-700",
                  formFieldInput: "border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white rounded-lg",
                  formButtonSecondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg",
                  footerActionLink: "text-blue-600 hover:text-blue-700",
                  identityPreviewText: "text-gray-600",
                  identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
                  badge: "bg-blue-100 text-blue-800 rounded-full",
                  avatarBox: "w-16 h-16",
                  avatarImage: "w-full h-full object-cover rounded-full",
                  formFieldSuccessText: "text-green-600",
                  formFieldErrorText: "text-red-600",
                  alertText: "text-red-600",
                  formResendCodeLink: "text-blue-600 hover:text-blue-700",
                  otpCodeFieldInput: "border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                  phoneInputBox: "border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                  countrySelect: "border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                  selectButton: "border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                  selectOption: "hover:bg-gray-100",
                  modalCloseButton: "text-gray-400 hover:text-gray-600"
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
