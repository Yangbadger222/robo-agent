"use client";

import { useProjectStore } from "@/stores/projectStore";
import { useStructureStore } from "@/stores/structureStore";
import { useMotorStore } from "@/stores/motorStore";
import { useHardwareStore } from "@/stores/hardwareStore";
import { useSoftwareStore } from "@/stores/softwareStore";
import { Download, Package } from "lucide-react";

export default function ReviewPage() {
  const project = useProjectStore((s) => s.projectSpec);
  const structure = useStructureStore((s) => s.structureSpec);
  const motors = useMotorStore((s) => s.motorSelections);
  const hardware = useHardwareStore((s) => s.hardwareBom);
  const software = useSoftwareStore((s) => s.generatedCode);

  const totalMotorCost = motors.reduce((sum, m) => sum + (m.estimated_price ?? 0), 0);
  const totalHardwareCost = hardware.reduce((sum, h) => sum + (h.estimated_price ?? 0), 0);
  const totalCost = totalMotorCost + totalHardwareCost;
  const fileCount = Object.keys(software).length;

  const handleExport = async () => {
    const projectId = project?.project_id || "default";
    try {
      const resp = await fetch(`/api/export/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generated_code: software }),
      });
      if (!resp.ok) throw new Error(`Export failed: ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectId}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] p-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-widest uppercase text-neon-cyan/60">// review</span>
            <h2 className="text-xl font-semibold">Review & Export</h2>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover-glow animate-glow-pulse transition"
          >
            <Download className="w-4 h-4" />
            Download All (ZIP)
          </button>
        </div>

        {/* Project Summary */}
        <div className="rounded-lg glass-card p-5 space-y-2 corner-brackets">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-neon-cyan" />
            <h3 className="font-mono text-xs tracking-wider uppercase text-neon-cyan/70">Project</h3>
          </div>
          {project ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground font-mono text-xs">Name:</span> {project.robot_name}</div>
              <div><span className="text-muted-foreground font-mono text-xs">Type:</span> {project.robot_type}</div>
              <div><span className="text-muted-foreground font-mono text-xs">DOF:</span> {project.dof}</div>
              <div><span className="text-muted-foreground font-mono text-xs">Payload:</span> {project.payload_kg} kg</div>
              <div><span className="text-muted-foreground font-mono text-xs">Reach:</span> {project.reach_m} m</div>
              <div><span className="text-muted-foreground font-mono text-xs">Budget:</span> ${project.budget_usd}</div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No project defined.</p>
          )}
        </div>

        {/* Structure Summary */}
        <div className="rounded-lg glass-card p-5 space-y-2 corner-brackets">
          <h3 className="font-mono text-xs tracking-wider uppercase text-neon-cyan/70">Structure</h3>
          {structure ? (
            <p className="text-sm text-muted-foreground">
              {structure.links?.length || 0} links, {structure.joints?.length || 0} joints
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No structure defined.</p>
          )}
        </div>

        {/* BOM Table */}
        {(motors.length > 0 || hardware.length > 0) && (
          <div className="rounded-lg glass-card overflow-hidden corner-brackets">
            <div className="p-4 border-b border-neon-cyan/15">
              <h3 className="font-mono text-xs tracking-wider uppercase text-neon-cyan/70">Bill of Materials</h3>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                Estimated total: <span className="text-neon-cyan">${totalCost.toFixed(2)}</span>
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neon-cyan/15">
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] tracking-wider uppercase text-neon-cyan/50">Category</th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] tracking-wider uppercase text-neon-cyan/50">Component</th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] tracking-wider uppercase text-neon-cyan/50">MPN</th>
                  <th className="px-4 py-2.5 text-right font-mono text-[10px] tracking-wider uppercase text-neon-cyan/50">Price</th>
                </tr>
              </thead>
              <tbody>
                {motors.map((m, i) => (
                  <tr key={`m${i}`} className="border-t border-border/20 hover:bg-neon-cyan/5 transition">
                    <td className="px-4 py-2 text-muted-foreground">Motor ({m.joint_name})</td>
                    <td className="px-4 py-2">{m.recommended_motor}</td>
                    <td className="px-4 py-2 font-mono text-xs text-neon-cyan/60">{m.mpn}</td>
                    <td className="px-4 py-2 text-right font-mono">${m.estimated_price ?? "N/A"}</td>
                  </tr>
                ))}
                {hardware.map((h, i) => (
                  <tr key={`h${i}`} className="border-t border-border/20 hover:bg-neon-cyan/5 transition">
                    <td className="px-4 py-2 text-muted-foreground">{h.category}</td>
                    <td className="px-4 py-2">{h.name}</td>
                    <td className="px-4 py-2 font-mono text-xs text-neon-cyan/60">{h.mpn}</td>
                    <td className="px-4 py-2 text-right font-mono">${h.estimated_price ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Code Files */}
        {fileCount > 0 && (
          <div className="rounded-lg glass-card p-5 space-y-2 corner-brackets">
            <h3 className="font-mono text-xs tracking-wider uppercase text-neon-cyan/70">Generated Files ({fileCount})</h3>
            <div className="grid grid-cols-2 gap-1">
              {Object.keys(software).sort().map((f) => (
                <div key={f} className="text-sm font-mono text-muted-foreground hover:text-neon-cyan/70 transition">{f}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
