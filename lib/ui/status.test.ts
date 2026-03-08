import { describe, it, expect } from "vitest";
import { statusVariant, statusBorderClass } from "./status";

describe("statusVariant", () => {
  it("completed → success", () => {
    expect(statusVariant("completed")).toBe("success");
  });

  it("pending → warning", () => {
    expect(statusVariant("pending")).toBe("warning");
  });

  it("failed → error", () => {
    expect(statusVariant("failed")).toBe("error");
  });
});

describe("statusBorderClass", () => {
  it("completed → border-ve-success/50", () => {
    expect(statusBorderClass("completed")).toBe("border-ve-success/50");
  });

  it("pending → border-ve-warning/50", () => {
    expect(statusBorderClass("pending")).toBe("border-ve-warning/50");
  });

  it("failed → border-ve-error/50", () => {
    expect(statusBorderClass("failed")).toBe("border-ve-error/50");
  });
});
