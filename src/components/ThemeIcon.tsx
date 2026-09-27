import { Moon, Sun } from "lucide-react";

interface ThemeIconProps {
  theme: "light" | "dark";
}

// Shows the icon for the state a click would switch *to* (matching the
// original convention) — Sun while in dark mode (click to go light), Moon
// while in light mode (click to go dark). Both are plain lucide-react
// icons using currentColor for stroke — genuinely monochrome, unlike the
// old hand-drawn sun which was hardcoded yellow regardless of theme.
// Color now comes entirely from the button's own CSS color (which follows
// --color-text), so the icon is dark in light theme and light in dark
// theme, same as any other icon in the app.
function ThemeIcon({ theme }: ThemeIconProps) {
  if (theme === "dark") {
    return <Sun size={18} aria-hidden="true" />;
  }

  return <Moon size={18} aria-hidden="true" />;
}

export default ThemeIcon;
