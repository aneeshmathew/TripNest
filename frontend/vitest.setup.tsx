import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

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
