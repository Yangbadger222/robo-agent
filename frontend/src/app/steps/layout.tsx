import { StepperBar } from "@/components/StepperBar";

export default function StepsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background grid-bg relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,255,0.04)_0%,transparent_60%)]" />
      <div className="relative">
        <StepperBar />
        <main>{children}</main>
      </div>
    </div>
  );
}
