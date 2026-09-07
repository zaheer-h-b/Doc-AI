import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Loader2 
} from "lucide-react";
import "./Auth.css";

const API_URL = import.meta.env.VITE_API_URL;

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
        `${API_URL}/api/auth/login`,
        formData
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success(response.data.message || "Logged in successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 600);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid credentials. Please try again."
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
              <Sparkles size={14} /> Intelligent Document Engine
            </div>

            <h1 className="showcase-title">
              Understand your <br />
              <span className="gradient-text">documents with AI.</span>
            </h1>

            <p className="showcase-desc">
              Upload research papers, PDF reports, or lecture notes. Ask natural questions and get exact, source-referenced answers instantly.
            </p>

            {/* Interactive Mock Preview Card */}
            <div className="mock-preview-card">
              <div className="mock-card-header">
                <div className="mock-doc-pill">
                  <FileText size={16} color="#818cf8" />
                  <span>OS_Full_Notes.pdf</span>
                </div>
                <span className="mock-status-pill">
                  <CheckCircle2 size={12} /> Indexed
                </span>
              </div>

              <div className="mock-msg-user">
                What is priority job scheduling and starvation?
              </div>

              <div className="mock-msg-ai">
                <span>
                  Priority scheduling allocates CPU based on priority levels. Starvation occurs when low-priority jobs wait indefinitely, solved via <strong>aging</strong>.
                </span>
                <span className="mock-source-tag">Chapter 3 · Page 14</span>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="showcase-features">
            <div className="showcase-feature-item">
              <ShieldCheck size={18} />
              <span>Private & secure — your files are never used for training</span>
            </div>
            <div className="showcase-feature-item">
              <CheckCircle2 size={18} />
              <span>Powered by semantic vector embeddings & fast retrieval</span>
            </div>
          </div>
        </section>

        {/* Right Column: Sign In Form */}
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
              <span className="auth-intro-badge">WELCOME BACK</span>
              <h2 className="auth-intro-title">Sign in to your account</h2>
              <p className="auth-intro-sub">Continue chatting with your documents</p>
            </div>

            <form onSubmit={handleSubmit}>
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
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="auth-switch-link">
              Don't have an account yet?{" "}
              <Link to="/register">Create an account</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;