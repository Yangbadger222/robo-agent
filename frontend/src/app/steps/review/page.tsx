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

  const totalMotorCost = motors.reduce((sum, m) => sum + m.estimated_price, 0);
  const totalHardwareCost = hardware.reduce((sum, h) => sum + h.estimated_price, 0);
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Review & Export</h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition"
          >
            <Download className="w-4 h-4" />
            Download All (ZIP)
          </button>
        </div>

        {/* Project Summary */}
        <div className="rounded-lg border border-border p-5 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="font-medium">Project</h3>
          </div>
          {project ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {project.robot_name}</div>
              <div><span className="text-muted-foreground">Type:</span> {project.robot_type}</div>
              <div><span className="text-muted-foreground">DOF:</span> {project.dof}</div>
              <div><span className="text-muted-foreground">Payload:</span> {project.payload_kg} kg</div>
              <div><span className="text-muted-foreground">Reach:</span> {project.reach_m} m</div>
              <div><span className="text-muted-foreground">Budget:</span> ${project.budget_usd}</div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No project defined.</p>
          )}
        </div>

        {/* Structure Summary */}
        <div className="rounded-lg border border-border p-5 space-y-2">
          <h3 className="font-medium">Structure</h3>
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
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium">Bill of Materials</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Estimated total: ${totalCost.toFixed(2)}
              </p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Component</th>
                  <th className="px-4 py-2 text-left">MPN</th>
                  <th className="px-4 py-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {motors.map((m, i) => (
                  <tr key={`m${i}`} className="border-t border-border">
                    <td className="px-4 py-2 text-muted-foreground">Motor ({m.joint_name})</td>
                    <td className="px-4 py-2">{m.recommended_motor}</td>
                    <td className="px-4 py-2 font-mono text-xs">{m.mpn}</td>
                    <td className="px-4 py-2 text-right">${m.estimated_price}</td>
                  </tr>
                ))}
                {hardware.map((h, i) => (
                  <tr key={`h${i}`} className="border-t border-border">
                    <td className="px-4 py-2 text-muted-foreground">{h.category}</td>
                    <td className="px-4 py-2">{h.name}</td>
                    <td className="px-4 py-2 font-mono text-xs">{h.mpn}</td>
                    <td className="px-4 py-2 text-right">${h.estimated_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Code Files */}
        {fileCount > 0 && (
          <div className="rounded-lg border border-border p-5 space-y-2">
            <h3 className="font-medium">Generated Files ({fileCount})</h3>
            <div className="grid grid-cols-2 gap-1">
              {Object.keys(software).sort().map((f) => (
                <div key={f} className="text-sm font-mono text-muted-foreground">{f}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
