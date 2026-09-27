"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login as loginRequest } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface LoginFormProps {
  /** Renders just the card, without the full-page centering wrapper — used inside AuthModal. */
  embedded?: boolean;
  /** Called after a successful login instead of redirecting to "/" — used by AuthModal to close itself. */
  onSuccess?: () => void;
  /** Swaps the "Sign up" link for a button that switches the modal's mode instead of navigating. */
  onSwitchToSignup?: () => void;
}

function LoginForm({ embedded = false, onSuccess, onSwitchToSignup }: LoginFormProps) {
  const router = useRouter();
  const { login: setAuthenticated } = useAuth();
  const [email, setEmail] = useState("user1@mail.com");
  const [password, setPassword] = useState("user123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const data = await loginRequest(email, password);
      setAuthenticated(data);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/");
      }
    } catch (requestError) {
      const message =
        requestError instanceof ApiError ? requestError.message : "Login failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const form = (
    <form className="login-card" onSubmit={handleSubmit}>
      <h1>Login</h1>
      <p>Use demo account credentials to sign in.</p>

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

      <p className="auth-switch-link">
        Don&apos;t have an account?{" "}
        {onSwitchToSignup ? (
          <button type="button" className="auth-switch-btn" onClick={onSwitchToSignup}>
            Sign up
          </button>
        ) : (
          <Link href="/signup">Sign up</Link>
        )}
      </p>
    </form>
  );

  return embedded ? form : <section className="login-shell">{form}</section>;
}

export default LoginForm;
