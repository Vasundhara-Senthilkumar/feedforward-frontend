import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiArrowRight } from "react-icons/fi";
import Logo from "../components/Logo";

const Field = ({ label, icon: Icon, focused, children }) => (
  <div>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--bark-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>
      {label}
    </label>
    <motion.div animate={{ scale: focused ? 1.01 : 1 }} transition={{ duration: 0.15 }} className="relative">
      <Icon style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: focused ? "var(--saffron)" : "var(--bark-muted)", transition: "color .18s", pointerEvents: "none" }} size={15} />
      {children}
    </motion.div>
  </div>
);

const inputStyle = (focused) => ({
  width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 12, paddingBottom: 12,
  fontSize: 14, background: "#fff", color: "var(--text)",
  border: `1.5px solid ${focused ? "var(--saffron)" : "var(--border)"}`,
  borderRadius: 11, transition: "border-color .18s",
});

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "ngo", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm({ ...form, [k]: v });
  const fc = (k) => ({ onFocus: () => setFocused({ ...focused, [k]: true }), onBlur: () => setFocused({ ...focused, [k]: false }) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", form);
      login(data);
      toast.success(`Welcome aboard, ${data.name}! 🌾`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--cream)" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [.22, 1, .36, 1] }}
        style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 24, border: "1.5px solid var(--border)", boxShadow: "var(--shadow-lg)", padding: 36 }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Logo variant="light" size="sm" animate={true} to="" />
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 28, color: "var(--bark)", letterSpacing: "-0.4px", marginBottom: 4 }}>Create account</h2>
        <p style={{ color: "var(--bark-muted)", fontSize: 13, marginBottom: 26 }}>Join the movement against food waste</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Full name" icon={FiUser} focused={focused.name}>
            <input type="text" name="name" placeholder="Vasu Kumar" value={form.name} onChange={e => set("name", e.target.value)} required style={inputStyle(focused.name)} {...fc("name")} />
          </Field>

          <Field label="Email" icon={FiMail} focused={focused.email}>
            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} autoComplete="email" required style={inputStyle(focused.email)} {...fc("email")} />
          </Field>

          <Field label="Password" icon={FiLock} focused={focused.password}>
            <input type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set("password", e.target.value)} autoComplete="new-password" required style={inputStyle(focused.password)} {...fc("password")} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Phone" icon={FiPhone} focused={focused.phone}>
              <input type="text" name="phone" placeholder="9876543210" value={form.phone} onChange={e => set("phone", e.target.value)} style={inputStyle(focused.phone)} {...fc("phone")} />
            </Field>
            <Field label="City" icon={FiMapPin} focused={focused.address}>
              <input type="text" name="address" placeholder="Chennai" value={form.address} onChange={e => set("address", e.target.value)} style={inputStyle(focused.address)} {...fc("address")} />
            </Field>
          </div>

          {/* Role selector */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--bark-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>I am a</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["ngo", "🤝", "NGO / Volunteer", "Accept food pickups"],
                ["provider", "🍱", "Food Provider", "Share surplus food"],
              ].map(([val, emoji, label, sub]) => (
                <motion.button key={val} type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => set("role", val)}
                  style={{
                    padding: "13px 12px", borderRadius: 13, textAlign: "left", cursor: "pointer",
                    border: `2px solid ${form.role === val ? "var(--saffron)" : "var(--border)"}`,
                    background: form.role === val ? "var(--saffron-light)" : "var(--parchment)",
                    transition: "all .18s",
                  }}
                >
                  <span style={{ fontSize: 22, display: "block" }}>{emoji}</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: form.role === val ? "var(--saffron-dark)" : "var(--bark)", marginTop: 8 }}>{label}</p>
                  <p style={{ fontSize: 11, color: "var(--bark-muted)", marginTop: 2 }}>{sub}</p>
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(232,129,10,.3)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: "100%", padding: "13px 0", marginTop: 4,
              background: loading ? "var(--clay)" : "var(--saffron)", color: "#fff",
              fontSize: 14, fontWeight: 700, borderRadius: 12, border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? "Creating account..." : <><span>Create account</span><FiArrowRight size={15} /></>}
          </motion.button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--bark-muted)", marginTop: 20 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--saffron)", fontWeight: 700 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
