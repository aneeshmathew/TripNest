import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SettingsForm from "./SettingsForm";

const useAuthMock = vi.fn();
const useThemeMock = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => useAuthMock()
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: () => useThemeMock()
}));

describe("SettingsForm", () => {
  it("shows a loading state before the auth check completes", () => {
    useAuthMock.mockReturnValue({ user: null, isAuthenticated: false, authChecked: false });
    useThemeMock.mockReturnValue({ theme: "light", toggleTheme: vi.fn() });

    render(<SettingsForm />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("prompts a logged-out visitor to log in instead of showing account details", () => {
    useAuthMock.mockReturnValue({ user: null, isAuthenticated: false, authChecked: true });
    useThemeMock.mockReturnValue({ theme: "light", toggleTheme: vi.fn() });

    render(<SettingsForm />);
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.queryByText("Account")).not.toBeInTheDocument();
  });

  it("shows account details and the theme toggle once authenticated", () => {
    useAuthMock.mockReturnValue({
      user: { id: "user-1", email: "user1@mail.com", name: "User 1", role: "TRAVELER" },
      isAuthenticated: true,
      authChecked: true
    });
    useThemeMock.mockReturnValue({ theme: "dark", toggleTheme: vi.fn() });

    render(<SettingsForm />);
    expect(screen.getByText("user1@mail.com")).toBeInTheDocument();
    expect(screen.getByText("User 1")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle-btn")).toHaveTextContent("Switch to light");
  });
});
