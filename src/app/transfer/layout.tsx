import { PageHeader } from "@/components/ui/header";

export default function TransferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex flex-col font-sans overflow-x-hidden bg-aqua-light">
            <PageHeader title="Transfer" />
            <div className="flex-1 w-full flex flex-col">
                {children}
            </div>
        </div>
    );
}
