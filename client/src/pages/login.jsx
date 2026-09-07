import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "${API_URL}/api/auth/login",
        formData
      );

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      toast.success(response.data.message);

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <section className="auth-brand">
          <div className="brand-logo">Doc-AI</div>

          <div className="brand-content">
            <span className="brand-label">
              DOCUMENT INTELLIGENCE
            </span>

            <h1>
              Understand your
              <br />
              documents better.
            </h1>

            <p>
              Upload your documents and ask questions
              using AI-powered search and intelligent
              answers.
            </p>

            <div className="brand-features">
              <div>
                <span>01</span>
                Upload your documents
              </div>

              <div>
                <span>02</span>
                Ask questions naturally
              </div>

              <div>
                <span>03</span>
                Get answers from your documents
              </div>
            </div>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-mobile-logo">
              Doc-AI
            </div>

            <div className="auth-heading">
              <span>WELCOME BACK</span>

              <h2>Sign in to your account</h2>

              <p>
                Continue where you left off.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Email address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="input-group">
                <label>Password</label>

                <div className="password-input-container">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "◉" : "○"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?
              <Link to="/register">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;