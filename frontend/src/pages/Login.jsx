import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_URL = "https://swivel-career-platform-g0jn.onrender.com";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid email or password");
      }

      // Save login information
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Send the user to the correct dashboard
      if (data.user.role === "candidate") {
        navigate("/candidate-dashboard");
      } else if (data.user.role === "evaluator") {
        navigate("/evaluator-dashboard");
      } else if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="auth-page">
        <div className="auth-container">
          <h1>Login</h1>

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="register-link">
              Don't have an account?{" "}
              <Link to="/register">Register</Link>
            </p>
          </form>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}
        </div>
      </main>
    </>
  );
}

export default Login;