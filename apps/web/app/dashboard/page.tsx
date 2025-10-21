import { SignedIn, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import InviteForm from "@/components/invite-form";
import { trpc } from "@/trpc/server";
import { createNextServerSupabaseClient } from "@chronos/supabase/src/next-server";
import { TRPCClientError } from "@trpc/client";

export default async function Dashboard() {
  const user = await currentUser();
  if (
    user?.publicMetadata.role !== "manager" &&
    user?.publicMetadata.role !== "admin"
  ) {
    return (
      <>
        <header className="flex justify-end items-center p-4 gap-4 h-16">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
        <div className="flex flex-col items-center gap-4 justify-center min-h-screen">
          <h1 className="text-4xl font-bold">Unauthorized</h1>
        </div>
      </>
    );
  }

  const supabase = createNextServerSupabaseClient();

  let teams;
  try {
    teams = await trpc.team.getAll.query();
    console.log("trpc teams", teams);
  } catch (error) {
    if (error instanceof TRPCClientError) {
      console.error("TRPC Client Error fetching teams: ", error.message);
    } else {
      console.error("Unknown error fetching teams: ", error);
    }
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user?.id)
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (!userData) throw new Error("User not found");

  return (
    <>
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <div className="flex flex-col items-center gap-4 justify-center min-h-screen">
        <h1 className="text-4xl font-bold">Hello {user?.firstName}</h1>
        <p className="text-lg">You are a {user?.publicMetadata.role}</p>
        <h2 className="text-2xl font-bold">
          {teams ? (
            <>
              <p>Teams:</p>
              <ul>
                {teams.map((team) => (
                  <li key={team.id}>{team.name}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>No teams found</p>
          )}
        </h2>
        <InviteForm />
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold">
            {userData.first_name} {userData.last_name}
          </h2>
          <p className="text-lg">{userData.email}</p>
        </div>
      </div>
    </>
  );
}
