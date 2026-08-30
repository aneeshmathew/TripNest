import { useState, type FormEvent } from "react";
import { login } from "../api/auth";
import { ApiError } from "../api/client";
import type { AuthResponse } from "../types/auth";

interface LoginPageProps {
  onLoginSuccess: (auth: AuthResponse) => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("user1@mail.com");
  const [password, setPassword] = useState("user123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const data = await login(email, password);
      onLoginSuccess(data);
    } catch (requestError) {
      const message =
        requestError instanceof ApiError ? requestError.message : "Login failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <p>Use demo account credentials to access featured apartments.</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-testid="login-email"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          data-testid="login-password"
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button
          type="submit"
          className="primary-btn"
          disabled={isSubmitting}
          data-testid="login-submit-btn"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </section>
  );
}

export default LoginPage;
