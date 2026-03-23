import type { CaseWorkspaceData } from "@/types/case";

const caseFiles: Record<string, () => Promise<CaseWorkspaceData>> = {
  "001": () => import("@/data/case-001-workspace.json").then((m) => m.default as CaseWorkspaceData),
};

export async function loadCase(id: string): Promise<CaseWorkspaceData | null> {
  const loader = caseFiles[id];
  if (!loader) return null;
  try {
    return await loader();
  } catch {
    return null;
  }
}

export function caseExists(id: string): boolean {
  return id in caseFiles;
}
