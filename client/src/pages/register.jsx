import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Loader2 
} from "lucide-react";
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

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        formData
      );

      toast.success(response.data.message || "Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        {/* Left Column: Product & Feature Showcase */}
        <section className="auth-showcase">
          <div className="showcase-glow-orb" />
          <div className="showcase-glow-orb-2" />

          {/* Logo */}
          <div className="auth-brand-logo">
            <div className="brand-icon-box">
              <Sparkles size={22} />
            </div>
            <div className="brand-title">
              Doc-AI
              <span className="brand-badge">2.0</span>
            </div>
          </div>

          {/* Center Showcase */}
          <div className="showcase-content">
            <div className="showcase-tag">
              <Zap size={14} /> Instant Workspace Setup
            </div>

            <h1 className="showcase-title">
              Turn your documents into an <br />
              <span className="gradient-text">interactive knowledge base.</span>
            </h1>

            <p className="showcase-desc">
              Create your account in seconds. Upload unlimited notes, PDFs, or presentations and chat with them using intelligent vector AI.
            </p>

            {/* Feature Showcase List */}
            <div className="showcase-features" style={{ marginTop: 24, gap: 16 }}>
              <div className="showcase-feature-item">
                <CheckCircle2 size={18} />
                <span>Upload PDF, DOCX, and TXT files up to 10MB</span>
              </div>
              <div className="showcase-feature-item">
                <CheckCircle2 size={18} />
                <span>Conversational search with precise text references</span>
              </div>
              <div className="showcase-feature-item">
                <CheckCircle2 size={18} />
                <span>Full chat history saved safely across sessions</span>
              </div>
              <div className="showcase-feature-item">
                <ShieldCheck size={18} />
                <span>Enterprise grade security & data privacy</span>
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <div style={{ color: "#64748b", fontSize: 13, zIndex: 2 }}>
            Trusted by modern learners, professionals, and engineering teams worldwide.
          </div>
        </section>

        {/* Right Column: Register Form */}
        <section className="auth-form-column">
          <div className="auth-form-wrap">
            {/* Mobile Header */}
            <div className="mobile-brand-header">
              <div className="brand-icon-box" style={{ width: 36, height: 36 }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Doc-AI</span>
            </div>

            <div className="auth-intro">
              <span className="auth-intro-badge">GET STARTED</span>
              <h2 className="auth-intro-title">Create your account</h2>
              <p className="auth-intro-sub">Start chatting with your documents for free</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-field-group">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-container">
                  <User size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    name="name"
                    className="auth-input"
                    placeholder="Zaheer Bannigol"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Email address</label>
                <div className="auth-input-container">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    name="email"
                    className="auth-input"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Password</label>
                <div className="auth-input-container">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="auth-input"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="auth-switch-link">
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;