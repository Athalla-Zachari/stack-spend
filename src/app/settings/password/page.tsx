import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import PasswordEditor, { PasswordEditorSkeleton } from "./PasswordEditor";

async function PasswordEditorSection() {
  await requireSession();
  return <PasswordEditor />;
}

export default function SettingsPasswordPage() {
  return (
    <main className="w-full flex flex-col bg-mist">
      <Suspense fallback={<PasswordEditorSkeleton />}>
        <PasswordEditorSection />
      </Suspense>
    </main>
  );
}
