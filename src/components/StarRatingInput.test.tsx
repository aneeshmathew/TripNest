import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import StarRatingInput from "./StarRatingInput";

describe("StarRatingInput", () => {
  it("marks stars up to the current value as filled", () => {
    render(<StarRatingInput label="Rating" value={3} onChange={() => {}} />);
    const filledStars = screen
      .getAllByRole("button")
      .filter((button) => button.className.includes("filled"));
    expect(filledStars).toHaveLength(3);
  });

  it("calls onChange with the clicked star's value", async () => {
    const onChange = vi.fn();
    render(<StarRatingInput label="Rating" value={2} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "4 stars" }));

    expect(onChange).toHaveBeenCalledWith(4);
  });
});
