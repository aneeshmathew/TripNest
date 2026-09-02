"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup as signupRequest } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

function SignupForm() {
  const router = useRouter();
  const { login: setAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const data = await signupRequest(email, password, name);
      // Signup returns the same token pair as login (see backend
      // auth.service.ts:signup) — sign the new account straight in
      // instead of bouncing them to a separate login step.
      setAuthenticated(data);
      router.push("/");
    } catch (requestError) {
      const message =
        requestError instanceof ApiError ? requestError.message : "Sign up failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Sign up</h1>
        <p>Create an account to start leaving reviews.</p>

        <label htmlFor="signup-name">Name</label>
        <input
          id="signup-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          data-testid="signup-name"
        />

        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-testid="signup-email"
        />

        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          data-testid="signup-password"
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button
          type="submit"
          className="primary-btn"
          disabled={isSubmitting}
          data-testid="signup-submit-btn"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>

        <p className="auth-switch-link">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}

export default SignupForm;
