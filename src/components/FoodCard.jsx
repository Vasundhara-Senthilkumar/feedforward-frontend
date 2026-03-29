import { motion, AnimatePresence } from "framer-motion";
import { MdLocationOn, MdAccessTime } from "react-icons/md";
import { FiUser, FiPackage } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const statusConfig = {
  pending:   { bg: "#FEF3E2", text: "#B5600A", dot: "#E8810A", label: "Pending", icon: "⏳" },
  accepted:  { bg: "#E8F5EB", text: "#1A4D24", dot: "#2D7A3A", label: "Accepted", icon: "✅" },
  completed: { bg: "#E8F5EB", text: "#1A4D24", dot: "#2D7A3A", label: "Completed", icon: "🎉" },
};

const typeConfig = {
  veg:       { bg: "#E8F5EB", text: "#1A4D24", label: "🥦 Veg", border: "#A8D5B0" },
  "non-veg": { bg: "#FEE9E9", text: "#7F1D1D", label: "🍗 Non-veg", border: "#F5AAAA" },
  both:      { bg: "#EEF2FF", text: "#3730A3", label: "🍱 Mixed", border: "#BFCBFF" },
};

const foodEmojis = {
  veg: ["🥗", "🥦", "🍛", "🥘", "🫕"],
  "non-veg": ["🍗", "🍖", "🥩", "🍳"],
  both: ["🍱", "🥡", "🍽️"],
};

const FoodCard = ({ food, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const s = statusConfig[food.status];
  const t = typeConfig[food.foodType] || typeConfig.both;

  const emoji = foodEmojis[food.foodType]?.[food._id?.charCodeAt(0) % 5 || 0] || "🍽️";

  // Time remaining
  const expiry = new Date(food.expiryTime);
  const now = new Date();
  const diff = expiry - now;
  const hoursLeft = Math.floor(diff / 3600000);
  const isUrgent = hoursLeft < 3 && hoursLeft >= 0;
  const isExpired = diff < 0;

  const handleAccept = async () => {
    setLoading("accept");
    try {
      await API.put(`/food/${food._id}/accept`);
      toast.success("Pickup accepted! 🤝");
      onUpdate();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    setLoading(null);
  };

  const handleComplete = async () => {
    setLoading("complete");
    try {
      await API.put(`/food/${food._id}/complete`);
      setJustCompleted(true);
      setTimeout(() => { onUpdate(); setJustCompleted(false); }, 900);
      toast.success("Marked complete! 🎉");
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    setLoading(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: justCompleted ? 0.5 : 1, y: 0, scale: justCompleted ? 0.97 : 1 }}
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(61,43,31,.12)" }}
      transition={{ duration: 0.2 }}
      style={{
        background: "#fff",
        borderRadius: 20,
        border: `1.5px solid ${isUrgent ? "rgba(232,129,10,.35)" : "var(--border)"}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: isUrgent ? "0 0 0 3px rgba(232,129,10,.1)" : "var(--shadow-sm)",
        position: "relative",
      }}
    >
      {/* Urgent ribbon */}
      <AnimatePresence>
        {isUrgent && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{ height: 3, background: "linear-gradient(90deg, var(--saffron), #f59e0b)", transformOrigin: "left" }}
          />
        )}
      </AnimatePresence>

      {/* Card header strip */}
      <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          {/* Food emoji */}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.4 }}
            style={{ width: 44, height: 44, borderRadius: 12, background: "var(--parchment)", border: "1px solid var(--border)", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >{emoji}</motion.div>

          {/* Status badge */}
          <span style={{
            display: "flex", alignItems: "center", gap: 4,
            background: s.bg, color: s.text,
            borderRadius: 99, fontSize: 11, fontWeight: 700,
            padding: "4px 10px", flexShrink: 0,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
            {s.label}
          </span>
        </div>

        <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "var(--bark)", lineHeight: 1.2, marginBottom: 6 }}>
          {food.title}
        </h3>

        {food.description && (
          <p style={{ fontSize: 12, color: "var(--bark-muted)", lineHeight: 1.5, marginBottom: 8 }}>{food.description}</p>
        )}

        {/* Tags row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ background: t.bg, color: t.text, border: `1px solid ${t.border}`, borderRadius: 7, fontSize: 11, fontWeight: 700, padding: "3px 9px" }}>{t.label}</span>
          <span style={{ background: "var(--parchment)", color: "var(--bark-muted)", border: "1px solid var(--border)", borderRadius: 7, fontSize: 11, fontWeight: 600, padding: "3px 9px", display: "flex", alignItems: "center", gap: 3 }}>
            <FiPackage size={10} />{food.quantity}
          </span>
          {isUrgent && (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ background: "var(--saffron-light)", color: "var(--saffron-dark)", border: "1px solid rgba(232,129,10,.3)", borderRadius: 7, fontSize: 11, fontWeight: 700, padding: "3px 9px" }}
            >⚡ {hoursLeft}h left</motion.span>
          )}
          {isExpired && (
            <span style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 7, fontSize: 11, fontWeight: 700, padding: "3px 9px" }}>Expired</span>
          )}
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--bark-muted)" }}>
          <MdLocationOn size={13} style={{ color: "var(--leaf)", flexShrink: 0 }} />
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{food.location}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--bark-muted)" }}>
          <MdAccessTime size={13} style={{ color: "var(--saffron)", flexShrink: 0 }} />
          <span>Expires {expiry.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--bark-muted)" }}>
          <FiUser size={11} style={{ color: "var(--clay)", flexShrink: 0 }} />
          <span>{food.provider?.name}</span>
        </div>
      </div>

      {/* Action */}
      {((user.role === "ngo" && food.status === "pending") || food.status === "accepted") && (
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
          {user.role === "ngo" && food.status === "pending" && (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(45,122,58,.25)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAccept}
              disabled={loading === "accept"}
              style={{
                width: "100%", padding: "11px 0", fontSize: 13, fontWeight: 700,
                background: loading === "accept" ? "var(--leaf-light)" : "var(--leaf)",
                color: loading === "accept" ? "var(--leaf)" : "#fff",
                borderRadius: 11, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all .18s",
              }}
            >
              {loading === "accept" ? "Accepting..." : "🤝 Accept Pickup"}
            </motion.button>
          )}
          {food.status === "accepted" && (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(232,129,10,.25)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleComplete}
              disabled={loading === "complete"}
              style={{
                width: "100%", padding: "11px 0", fontSize: 13, fontWeight: 700,
                background: loading === "complete" ? "var(--saffron-light)" : "var(--saffron)",
                color: loading === "complete" ? "var(--saffron)" : "#fff",
                borderRadius: 11, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all .18s",
              }}
            >
              {loading === "complete" ? "Saving..." : "🎉 Mark as Completed"}
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FoodCard;
