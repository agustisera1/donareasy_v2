import { revalidatePath } from "next/cache";

export type RevalidationTarget = { path: string; type?: "layout" | "page" };

export function revalidatePaths(targets: RevalidationTarget[]) {
  for (const { path, type } of targets) revalidatePath(path, type);
}
