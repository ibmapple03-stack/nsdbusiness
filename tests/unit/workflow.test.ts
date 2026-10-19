import { describe, expect, it } from "vitest";
import { WorkflowError, assertSeparateApprover, availableActions, nextStatus } from "@/server/workflow";

describe("editorial workflow", () => {
  it("follows draft → submitted → approved → published", () => {
    expect(nextStatus("DRAFT", "submit")).toBe("SUBMITTED");
    expect(nextStatus("SUBMITTED", "approve")).toBe("APPROVED");
    expect(nextStatus("APPROVED", "publish")).toBe("PUBLISHED");
  });

  it("cannot publish without approval", () => {
    expect(() => nextStatus("DRAFT", "publish")).toThrow(WorkflowError);
    expect(() => nextStatus("SUBMITTED", "publish")).toThrow(WorkflowError);
  });

  it("cannot approve something that was never submitted", () => {
    expect(() => nextStatus("DRAFT", "approve")).toThrow(WorkflowError);
  });

  it("returned work goes back through submission", () => {
    expect(nextStatus("SUBMITTED", "reject")).toBe("REJECTED");
    expect(availableActions("REJECTED")).toContain("submit");
    expect(availableActions("REJECTED")).not.toContain("publish");
  });

  it("the submitter cannot approve their own submission", () => {
    expect(() => assertSeparateApprover("approve", "u1", "u1")).toThrow(WorkflowError);
    expect(() => assertSeparateApprover("approve", "u2", "u1")).not.toThrow();
    expect(() => assertSeparateApprover("reject", "u1", "u1")).not.toThrow();
  });
});
