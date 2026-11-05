import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="w-full flex flex-col">
      {/* <form action={logoutAction} className="mt-4">
          <Button
            type="submit"
            variant="solid"
            size="lg"
            className="w-full bg-teal text-white hover:bg-teal-mid"
          >
            Logout
          </Button>
        </form> */}
      <section className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-lg text-teal-deep font-bold">StackSpend</h1>
          <p>Welcome back, your name</p>
        </div>
        <div>
          
        </div>
      </section>
    </main>
  );
}
