import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Auth.css";

const API_URL = import.meta.env.VITE_API_URL;

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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

    if (
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        formData
      );

      toast.success(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed"
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
              Understand your documents
              <br />
              faster.
            </h1>

            <p>
              Create your account and turn your
              documents into an interactive knowledge
              base.
            </p>

            <div className="brand-features">
              <div>
                <span>01</span>
                Create your workspace
              </div>

              <div>
                <span>02</span>
                Upload your documents
              </div>

              <div>
                <span>03</span>
                Start learning instantly
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
              <span>GET STARTED</span>

              <h2>Create your account</h2>

              <p>
                Start chatting with your documents.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Full name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>

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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
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
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/login">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;