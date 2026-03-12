import { StepperBar } from "@/components/StepperBar";

export default function StepsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <StepperBar />
      <main>{children}</main>
    </div>
  );
}
