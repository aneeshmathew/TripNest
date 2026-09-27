import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ThemeIcon from "./ThemeIcon";

describe("ThemeIcon", () => {
  it("renders a monochrome sun (lucide, currentColor) when in dark mode", () => {
    const { container } = render(<ThemeIcon theme="dark" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("lucide-sun");
    expect(svg).not.toHaveAttribute("fill", "#f5c542");
  });

  it("renders a monochrome moon (lucide, currentColor) when in light mode", () => {
    const { container } = render(<ThemeIcon theme="light" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("lucide-moon");
  });
});
