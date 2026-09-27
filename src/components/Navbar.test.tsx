import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn()
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn()
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseTheme = vi.mocked(useTheme);

function mockLoggedIn() {
  mockedUseAuth.mockReturnValue({
    user: { id: "1", email: "user1@mail.com", name: "User 1", role: "TRAVELER" },
    authChecked: true,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn()
  });
}

function mockLoggedOut() {
  mockedUseAuth.mockReturnValue({
    user: null,
    authChecked: true,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn()
  });
}

describe("Navbar account menu", () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({ theme: "light", toggleTheme: vi.fn() });
  });

  it("shows Login/Sign up when logged out, no account menu", () => {
    mockLoggedOut();
    render(<Navbar />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByTestId("signup-nav-link")).toBeInTheDocument();
    expect(screen.queryByTestId("account-menu-trigger")).not.toBeInTheDocument();
  });

  it("shows 'Hello <name>' using the real User.name field once logged in", () => {
    mockLoggedIn();
    render(<Navbar />);
    expect(screen.getByTestId("account-menu-trigger")).toHaveTextContent("Hello User 1");
  });

  it("the dropdown is closed by default and opens on trigger click", async () => {
    mockLoggedIn();
    render(<Navbar />);
    expect(screen.queryByTestId("account-menu-dropdown")).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId("account-menu-trigger"));
    expect(screen.getByTestId("account-menu-dropdown")).toBeInTheDocument();
  });

  it("only lists real destinations — Settings and Logout — nothing fabricated", async () => {
    mockLoggedIn();
    render(<Navbar />);
    await userEvent.click(screen.getByTestId("account-menu-trigger"));

    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Settings");
    expect(items[1]).toHaveTextContent("Logout");
  });

  it("closes when Escape is pressed", async () => {
    mockLoggedIn();
    render(<Navbar />);
    await userEvent.click(screen.getByTestId("account-menu-trigger"));
    expect(screen.getByTestId("account-menu-dropdown")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByTestId("account-menu-dropdown")).not.toBeInTheDocument();
  });

  it("closes when clicking outside the menu", async () => {
    mockLoggedIn();
    render(
      <div>
        <Navbar />
        <button type="button">Outside</button>
      </div>
    );
    await userEvent.click(screen.getByTestId("account-menu-trigger"));
    expect(screen.getByTestId("account-menu-dropdown")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Outside"));
    expect(screen.queryByTestId("account-menu-dropdown")).not.toBeInTheDocument();
  });
});
