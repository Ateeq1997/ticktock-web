import { render, screen } from "@testing-library/react";
import StatusBadge from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders COMPLETED badge", () => {
    render(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders INCOMPLETE badge", () => {
    render(<StatusBadge status="INCOMPLETE" />);
    expect(screen.getByText("Incomplete")).toBeInTheDocument();
  });

  it("renders MISSING badge", () => {
    render(<StatusBadge status="MISSING" />);
    expect(screen.getByText("Missing")).toBeInTheDocument();
  });

  it("applies correct class for COMPLETED", () => {
    const { container } = render(<StatusBadge status="COMPLETED" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("green");
  });

  it("applies correct class for MISSING", () => {
    const { container } = render(<StatusBadge status="MISSING" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("red");
  });
});
