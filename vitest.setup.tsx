import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Vitest doesn't auto-register afterEach globally the way Jest does
// (this project doesn't set test.globals in vitest.config.ts, and even
// projects that do still need this for RTL specifically) — so
// @testing-library/react's own built-in auto-cleanup, which looks for a
// global `afterEach`, never fires without this. Symptom without it:
// "Found multiple elements with role X and name Y" in any test file
// where more than one `it` block calls render() — the previous test's
// DOM is still mounted when the next one queries the document.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement scrolling APIs at all (no layout engine), so
// HTMLElement.prototype.scrollBy/scrollTo simply don't exist here —
// vi.spyOn requires the property to already exist as a function so it
// has something to wrap, so component tests that spy on these (the
// carousel components' Previous/Next buttons and auto-scroll) need a
// real no-op function present first.
if (!HTMLElement.prototype.scrollBy) {
  HTMLElement.prototype.scrollBy = () => {};
}
if (!HTMLElement.prototype.scrollTo) {
  HTMLElement.prototype.scrollTo = () => {};
}

// next/image expects Next's build-time image optimization pipeline;
// next/link expects an App Router context for prefetching. Neither exists
// under plain Vitest+jsdom, so both get swapped for plain <img>/<a> —
// enough to test what our components actually render, without pulling in
// Next's full runtime just to run a component test.
vi.mock("next/image", () => ({
  default: ({ fill: _fill, priority: _priority, ...rest }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} />;
  }
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: unknown; children: unknown }) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children as never}
    </a>
  )
}));
