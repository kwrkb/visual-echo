import type { GenerationStatus } from "@/types/database";

/** Badge variant corresponding to a generation status */
export function statusVariant(status: GenerationStatus) {
  switch (status) {
    case "completed":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "failed":
      return "error" as const;
  }
}

/** Border color class for tree nodes based on status */
export function statusBorderClass(status: GenerationStatus) {
  switch (status) {
    case "completed":
      return "border-ve-success/50";
    case "pending":
      return "border-ve-warning/50";
    case "failed":
      return "border-ve-error/50";
  }
}
