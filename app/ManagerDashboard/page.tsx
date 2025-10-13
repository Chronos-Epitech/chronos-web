import {ProfileCard} from "@/components/ui/profileCard";

    
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <ProfileCard
        avatar="/path/to/image.jpg"
        avatarFallback="U   "
        firstName="User Name"
        lastName="User Last Name"
      />
    </div>
  );
}