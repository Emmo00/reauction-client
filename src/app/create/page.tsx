import { CreateFlow } from "@/components/create-flow";
import { BottomNav } from "@/components/bottom-nav";

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      <CreateFlow />
      <BottomNav />
    </main>
  );
}
