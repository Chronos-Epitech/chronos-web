import { ProfileCard } from "@/components/ui/profile-card";

export default function ManagerDashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <ProfileCard
        avatar="/path/to/image.jpg"
        avatarFallback="U"
        firstName="User Name"
        lastName="User Last Name"
      />
    </div>
  );
}
