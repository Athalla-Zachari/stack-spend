import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-beige p-6 flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-[32px] p-6 shadow-md flex flex-col gap-4 mt-12">
        <h1 className="text-2xl font-bold text-teal-deep">Dashboard</h1>
        <p className="text-subtext">Selamat datang, <span className="font-semibold text-charcoal">{session.displayName}</span>!</p>
        <p className="text-xs text-grey500">Email: {session.email}</p>

        <form action={logoutAction} className="mt-4">
          <Button
            type="submit"
            variant="solid"
            size="lg"
            className="w-full bg-teal text-white hover:bg-teal-mid"
          >
            Logout
          </Button>
        </form>
      </div>
    </main>
  );
}

