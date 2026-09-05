import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ThemeIcon from "./ThemeIcon";

describe("ThemeIcon", () => {
  it("renders a hardcoded yellow sun when in dark mode (not the brand's terracotta primary)", () => {
    const { container } = render(<ThemeIcon theme="dark" />);
    const circle = container.querySelector("circle");
    expect(circle).toHaveAttribute("fill", "#f5c542");
  });

  it("renders a monochrome (currentColor) moon when in light mode", () => {
    const { container } = render(<ThemeIcon theme="light" />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("fill", "currentColor");
  });
});
