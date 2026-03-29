import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import Logo from "../components/Logo";

const floatingFood = ["🍛", "🥗", "🍱", "🌾", "🥦", "🍅", "🫓", "🥕", "🍚", "🌽"];

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      login(data);
      toast.success(`Welcome back, ${data.name}! 🌾`, {
        style: { fontFamily: "'Outfit', sans-serif", background: "#FEF3E2", color: "#3D2B1F", border: "1px solid #EAE0CC" }
      });
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "var(--cream)" }}>

      {/* Floating food bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {floatingFood.map((f, i) => (
          <span key={i} style={{
            position: "absolute",
            left: `${(i * 10 + 5) % 100}%`,
            fontSize: "2rem",
            opacity: 0.05,
            animation: `floatFood ${14 + i * 1.7}s linear ${i * -2.1}s infinite`,
          }}>{f}</span>
        ))}
      </div>

      {/* Left panel */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [.22, 1, .36, 1] }}
        className="hidden lg:flex w-[520px] flex-col justify-between relative overflow-hidden flex-shrink-0"
        style={{ background: "var(--bark)" }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(232,129,10,.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(45,122,58,.1)", pointerEvents: "none" }} />

        <div className="relative z-10 p-12">
          {/* Logo */}
          <div style={{ marginBottom: 52 }}>
            <Logo variant="dark" size="md" animate={true} to="" />
          </div>

          {/* Headline */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 46, lineHeight: 1.08, color: "#fff", letterSpacing: "-1px" }}
            >
              Surplus food,<br />
              <span style={{ color: "var(--saffron)" }}>zero waste.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{ marginTop: 18, color: "rgba(255,255,255,.55)", fontSize: 15, lineHeight: 1.7, fontWeight: 400 }}
            >
              Connecting restaurants, wedding halls & canteens with NGOs — so every meal finds a plate.
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-3 mt-14"
          >
            {[["2,400+", "Meals saved", "🍽️"], ["80+", "NGO partners", "🤝"], ["0 kg", "Wasted", "♻️"]].map(([val, label, emoji]) => (
              <motion.div
                key={label}
                whileHover={{ y: -3, background: "rgba(255,255,255,.1)" }}
                style={{ background: "rgba(255,255,255,.06)", borderRadius: 14, border: "1px solid rgba(255,255,255,.08)", padding: "14px 12px", cursor: "default" }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{emoji}</div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 24, color: "#fff", lineHeight: 1 }}>{val}</p>
                <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.45)", marginTop: 4 }}>{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <p style={{ padding: "0 48px 32px", color: "rgba(255,255,255,.2)", fontSize: 11 }}>© 2025 FeedForward · All rights reserved</p>
      </motion.div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-8 relative z-10"
      >
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Logo variant="light" size="sm" animate={true} to="" />
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 34, color: "var(--bark)", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            Welcome back
          </h2>
          <p style={{ color: "var(--bark-muted)", fontSize: 14, marginTop: 6, marginBottom: 36 }}>Sign in to continue redistributing surplus food</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--bark-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Email address
              </label>
              <motion.div
                animate={{ scale: focusedField === "email" ? 1.01 : 1 }}
                transition={{ duration: 0.15 }}
                className="relative"
              >
                <FiMail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focusedField === "email" ? "var(--saffron)" : "var(--bark-muted)", transition: "color .18s", size: 16 }} size={16} />
                <input
                  type="email" name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="email"
                  required
                  style={{
                    width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 13, paddingBottom: 13,
                    fontSize: 14, background: "#fff", color: "var(--text)",
                    border: `1.5px solid ${focusedField === "email" ? "var(--saffron)" : "var(--border)"}`,
                    borderRadius: 12, transition: "border-color .18s",
                  }}
                />
              </motion.div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--bark-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Password
              </label>
              <motion.div
                animate={{ scale: focusedField === "password" ? 1.01 : 1 }}
                transition={{ duration: 0.15 }}
                className="relative"
              >
                <FiLock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focusedField === "password" ? "var(--saffron)" : "var(--bark-muted)", transition: "color .18s" }} size={16} />
                <input
                  type="password" name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="current-password"
                  required
                  style={{
                    width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 13, paddingBottom: 13,
                    fontSize: 14, background: "#fff", color: "var(--text)",
                    border: `1.5px solid ${focusedField === "password" ? "var(--saffron)" : "var(--border)"}`,
                    borderRadius: 12, transition: "border-color .18s",
                  }}
                />
              </motion.div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? "none" : "0 8px 24px rgba(232,129,10,.3)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%", padding: "14px 0", marginTop: 4,
                background: loading ? "var(--clay)" : "var(--saffron)",
                color: "#fff", fontSize: 15, fontWeight: 700,
                borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background .18s",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
                  Signing in...
                </span>
              ) : (
                <><span>Sign in</span><FiArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--bark-muted)", marginTop: 28 }}>
            No account?{" "}
            <Link to="/register" style={{ color: "var(--saffron)", fontWeight: 700, textDecoration: "none" }}
              className="hover:underline">Create one free</Link>
          </p>

          {/* Food divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 36 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 18, opacity: 0.4 }}>🌾</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: "var(--bark-muted)", marginTop: 14, opacity: 0.7 }}>
            Trusted by 80+ NGOs across Tamil Nadu
          </p>
        </div>
      </motion.div>

      <style>{`
        @keyframes floatFood {
          0%   { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;