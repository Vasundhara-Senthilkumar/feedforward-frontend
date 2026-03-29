import Logo from "../components/Logo";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import FoodCard from "../components/FoodCard";
import { FiPlus, FiArrowRight, FiRefreshCw, FiGrid, FiList } from "react-icons/fi";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toNum = (v) => { const n = parseInt(v); return isNaN(n) ? 0 : n; };

const extractName = (field) => {
  if (!field) return null;
  if (typeof field === "object") return field.name || null;
  if (typeof field === "string" && field.length > 0) return field;
  return null;
};

const normalizeZone = (raw) => {
  if (!raw) return "Unknown";
  return raw.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

// ─── Chart builders ───────────────────────────────────────────────────────────
const buildHourlyData = (entries) => {
  const completed = entries.filter(e => e.status === "completed" && e.updatedAt);
  if (completed.length < 2) return [];

  const times = completed.map(e => new Date(e.updatedAt).getTime());
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const totalMs = maxT - minT || 1;
  const bucketCount = Math.min(Math.ceil(totalMs / (1000 * 60 * 60)) || 1, 10);
  const bucketMs = totalMs / bucketCount;

  const buckets = Array.from({ length: bucketCount + 1 }, (_, i) => ({
    hour: `${Math.round((i * totalMs / bucketCount) / (1000 * 60 * 60))}h`,
    meals: 0,
    co2: 0,
  }));

  completed.forEach(e => {
    const t = new Date(e.updatedAt).getTime();
    const idx = Math.min(Math.floor((t - minT) / bucketMs), bucketCount);
    const qty = toNum(e.quantity);
    buckets[idx].meals += qty;
    buckets[idx].co2 += Math.round(qty * 0.25);
  });

  for (let i = 1; i < buckets.length; i++) {
    buckets[i].meals += buckets[i - 1].meals;
    buckets[i].co2  += buckets[i - 1].co2;
  }
  return buckets;
};

const buildFoodTypeData = (entries) => {
  const counts = { veg: 0, "non-veg": 0, mixed: 0 };
  entries.forEach(e => {
    const t = (e.foodType || "mixed").toLowerCase().trim();
    if (t in counts) counts[t]++; else counts.mixed++;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return [
    { name: "Vegetarian", value: Math.round((counts.veg          / total) * 100), color: "#2D7A3A" },
    { name: "Non-veg",    value: Math.round((counts["non-veg"]   / total) * 100), color: "#E8810A" },
    { name: "Mixed",      value: Math.round((counts.mixed        / total) * 100), color: "#C4956A" },
  ].filter(d => d.value > 0);
};

const buildProviderData = (entries) => {
  const map = {};
  entries.forEach(e => {
    const name = extractName(e.provider) || "Unknown"; // ✅ provider not createdBy
    map[name] = (map[name] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
};

const buildZoneData = (entries) => {
  const map = {};
  entries.forEach(e => {
    const raw  = e.location?.split(",")?.[0] || "Unknown";
    const zone = normalizeZone(raw);
    map[zone]  = (map[zone] || 0) + toNum(e.quantity);
  });
  const colors = ["#2D7A3A", "#E8810A", "#C4956A", "#7A5C48", "#3D2B1F", "#A8D5B0"];
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([zone, meals], i) => ({ zone, meals, color: colors[i % colors.length] }));
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Counter = ({ to }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!to) { setN(0); return; }
    let cur = 0;
    const step = Math.max(1, Math.ceil(to / 45));
    const t = setInterval(() => {
      cur = Math.min(cur + step, to);
      setN(cur);
      if (cur >= to) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, [to]);
  return <>{n.toLocaleString()}</>;
};

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-md)", fontSize: 12, fontFamily: "'Outfit',sans-serif" }}>
      <p style={{ fontWeight: 700, color: "var(--bark)", marginBottom: 4 }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.stroke || p.fill, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

const SH = ({ title, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 18, color: "var(--bark)", letterSpacing: "-0.3px" }}>{title}</h2>
    {sub && <p style={{ fontSize: 12, color: "var(--bark-muted)", marginTop: 3 }}>{sub}</p>}
  </div>
);

const Card = ({ children, delay = 0, style = {} }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.38, ease: [.22, 1, .36, 1] }}
    style={{ background: "#fff", borderRadius: 18, border: "1.5px solid var(--border)", padding: "22px 20px", boxShadow: "var(--shadow-sm)", ...style }}>
    {children}
  </motion.div>
);

const EmptyChart = ({ message = "No data yet" }) => (
  <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
    <span style={{ fontSize: 32 }}>📭</span>
    <p style={{ fontSize: 12, color: "var(--bark-muted)", textAlign: "center" }}>{message}</p>
  </div>
);

const statusStyle = {
  completed: { bg: "var(--leaf-light)",    color: "var(--leaf-dark)",    label: "✅ Completed" },
  accepted:  { bg: "var(--saffron-light)", color: "var(--saffron-dark)", label: "🤝 Accepted"  },
  pending:   { bg: "var(--parchment)",     color: "var(--bark-muted)",   label: "⏳ Pending"   },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const [allEntries, setAllEntries] = useState([]);
  const [myFood,     setMyFood]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [viewMode,   setViewMode]   = useState("grid");
  const [tab,        setTab]        = useState("overview");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: all } = await API.get("/food");
      const normalised = all.map(e => ({ ...e, quantity: toNum(e.quantity) }));
      setAllEntries(normalised);

      if (user.role === "provider") {
        const { data } = await API.get("/food/my");
        setMyFood(data.map(e => ({ ...e, quantity: toNum(e.quantity) })));
      } else if (user.role === "ngo") {
        setMyFood(normalised.filter(f => {
          const id = typeof f.acceptedBy === "object" ? f.acceptedBy?._id : f.acceptedBy;
          return String(id) === String(user._id);
        }));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const completedEntries = useMemo(() => allEntries.filter(e => e.status === "completed"), [allEntries]);
  const acceptedEntries  = useMemo(() => allEntries.filter(e => e.status === "accepted"),  [allEntries]);
  const pendingEntries   = useMemo(() => allEntries.filter(e => e.status === "pending"),   [allEntries]);

  const totalMeals = useMemo(() => completedEntries.reduce((a, b) => a + b.quantity, 0), [completedEntries]);
  const co2Saved   = Math.round(totalMeals * 0.25);
  const peopleFed  = Math.round(totalMeals * 1.4);
  const matchRate  = allEntries.length
    ? Math.round(((completedEntries.length + acceptedEntries.length) / allEntries.length) * 100)
    : 0;

  // ── Chart data ────────────────────────────────────────────────────────────
  const hourlyData   = useMemo(() => buildHourlyData(allEntries),   [allEntries]);
  const foodTypeData = useMemo(() => buildFoodTypeData(allEntries), [allEntries]);
  const providerData = useMemo(() => buildProviderData(allEntries), [allEntries]);
  const zoneData     = useMemo(() => buildZoneData(allEntries),     [allEntries]);
  const maxZone      = useMemo(() => Math.max(...zoneData.map(z => z.meals), 1), [zoneData]);

  const h     = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  const TABS = [
    { id: "overview", label: "📊 Overview"   },
    { id: "entries",  label: "📋 All Entries" },
    ...(user.role !== "admin"
      ? [{ id: "mine", label: user.role === "provider" ? "🍱 My Listings" : "🤝 My Pickups" }]
      : []),
  ];

  return (
    <div className="page-enter" style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 20px 60px" }}>

      {/* ── Hero ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "var(--bark)", borderRadius: 22, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(232,129,10,.14)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, right: 140, width: 160, height: 160, borderRadius: "50%", background: "rgba(45,122,58,.1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 8, right: 70, fontSize: 90, opacity: 0.05, userSelect: "none", pointerEvents: "none" }}>🍽️</div>
<div style={{ position: "relative", zIndex: 1 }}>
  <div style={{ marginBottom: 18 }}>
    <Logo variant="dark" size="sm" animate={true} to="" />
  </div>
  <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "0.13em", marginBottom: 7 }}>{greet}</p>
  <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 30, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1, marginBottom: 5 }}>{user.name} 👋</h1>
  <p style={{ fontSize: 12, color: "rgba(255,255,255,.45)" }}>The Smart Food Waste Redistribution System</p>
          {user.role === "provider" && (
            <Link to="/add-food">
              <motion.button whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(232,129,10,.35)" }} whileTap={{ scale: 0.97 }}
                style={{ marginTop: 18, background: "var(--saffron)", color: "#fff", border: "none", borderRadius: 11, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
                <FiPlus size={14} /> Add Food Listing
              </motion.button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* ── Impact stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { emoji: "🍽️", label: "Meals Redistributed", value: totalMeals, sub: `${completedEntries.length} completed listings`, color: "#E8810A" },
          { emoji: "🌿", label: "CO₂ Saved (kg)",      value: co2Saved,   sub: "vs landfill baseline",                          color: "#2D7A3A" },
          { emoji: "👥", label: "People Fed",           value: peopleFed,  sub: `Across ${allEntries.length} listings`,          color: "#C4956A" },
          { emoji: "🎯", label: "Match Rate",           value: matchRate,  sub: "Provider → NGO", color: "#7A5C48", suffix: "%" },
        ].map(({ emoji, label, value, sub, color, suffix = "" }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 + 0.05, duration: 0.38, ease: [.22, 1, .36, 1] }}
            whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(61,43,31,.1)" }}
            style={{ background: "#fff", borderRadius: 18, border: "1.5px solid var(--border)", padding: "18px 20px", boxShadow: "var(--shadow-sm)", cursor: "default" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--bark-muted)", textTransform: "uppercase", letterSpacing: "0.07em", lineHeight: 1.3 }}>{label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{emoji}</div>
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 34, color: "var(--bark)", lineHeight: 1, letterSpacing: "-1px" }}>
              <Counter to={value} />{suffix}
            </p>
            <p style={{ fontSize: 11, color: "var(--bark-muted)", marginTop: 5 }}>{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 0, marginBottom: 22, borderBottom: "1.5px solid var(--border)" }}>
        {TABS.map(t => (
          <motion.button key={t.id} onClick={() => setTab(t.id)} whileTap={{ scale: 0.95 }}
            style={{ padding: "9px 20px", fontSize: 13, fontWeight: 700, color: tab === t.id ? "var(--saffron)" : "var(--bark-muted)", background: "transparent", border: "none", cursor: "pointer", borderBottom: `2.5px solid ${tab === t.id ? "var(--saffron)" : "transparent"}`, marginBottom: -1.5, whiteSpace: "nowrap", transition: "all .18s" }}>
            {t.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════ OVERVIEW ════ */}
        {tab === "overview" && (
          <motion.div key="ov" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Completed", count: completedEntries.length, color: "#2D7A3A", bg: "var(--leaf-light)",    icon: "✅" },
                { label: "Accepted",  count: acceptedEntries.length,  color: "#E8810A", bg: "var(--saffron-light)", icon: "🤝" },
                { label: "Pending",   count: pendingEntries.length,   color: "#7A5C48", bg: "var(--parchment)",     icon: "⏳" },
              ].map(({ label, count, color, bg, icon }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }} whileHover={{ y: -2 }}
                  style={{ background: bg, border: "1px solid var(--border)", borderRadius: 14, padding: "14px 18px", cursor: "default" }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 30, color, letterSpacing: "-0.5px", lineHeight: 1, marginTop: 7 }}>{count}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--bark-muted)", marginTop: 4 }}>{label} entries</p>
                </motion.div>
              ))}
            </div>

            {/* Charts row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 14 }}>
              <Card delay={0.1}>
                <SH title="Meals redistributed over time" sub="Cumulative from completed listings" />
                {hourlyData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={hourlyData}>
                      <defs>
                        <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#E8810A" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#E8810A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "var(--bark-muted)", fontFamily: "'Outfit',sans-serif" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--bark-muted)", fontFamily: "'Outfit',sans-serif" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<Tip />} />
                      <Area type="monotone" dataKey="meals" name="Meals" stroke="#E8810A" strokeWidth={2.5} fill="url(#mg)" dot={{ r: 3, fill: "#E8810A" }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyChart message="Complete some listings to see the trend" />}
              </Card>

              <Card delay={0.14}>
                <SH title="Food type breakdown" />
                {foodTypeData.length ? (
                  <>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={foodTypeData} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {foodTypeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v}%`, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 6 }}>
                      {foodTypeData.map(d => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                          <span style={{ color: "var(--bark-muted)", flex: 1 }}>{d.name}</span>
                          <span style={{ fontWeight: 700, color: "var(--bark)" }}>{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <EmptyChart message="No listings yet" />}
              </Card>
            </div>

            {/* Charts row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <Card delay={0.18}>
                <SH title="CO₂ saved (kg)" sub="Environmental impact over time" />
                {hourlyData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={hourlyData}>
                      <defs>
                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#2D7A3A" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#2D7A3A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--bark-muted)", fontFamily: "'Outfit',sans-serif" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--bark-muted)", fontFamily: "'Outfit',sans-serif" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<Tip />} />
                      <Area type="monotone" dataKey="co2" name="CO₂ kg" stroke="#2D7A3A" strokeWidth={2.5} fill="url(#cg)" dot={{ r: 3, fill: "#2D7A3A" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyChart message="Complete listings to track CO₂ impact" />}
              </Card>

              <Card delay={0.22}>
                <SH title="Providers by name" />
                {providerData.length && providerData[0].name !== "Unknown" ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={providerData} layout="vertical" barSize={9}>
                      <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "var(--bark-muted)", fontFamily: "'Outfit',sans-serif" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "var(--bark-muted)", fontFamily: "'Outfit',sans-serif" }} axisLine={false} tickLine={false} width={100} />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="count" name="Listings" fill="#E8810A" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart message="No provider data yet" />}
              </Card>
            </div>

            {/* Zone impact */}
            <Card delay={0.26}>
              <SH title="Social reach by zone" sub="Meals redistributed per pickup area" />
              {zoneData.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  {zoneData.map((z, i) => (
                    <motion.div key={z.zone} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                        <span style={{ fontWeight: 600, color: "var(--bark)" }}>{z.zone}</span>
                        <span style={{ fontWeight: 700, color: "var(--bark-muted)" }}>{z.meals} meals</span>
                      </div>
                      <div style={{ height: 7, background: "var(--parchment)", borderRadius: 99, overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round((z.meals / maxZone) * 100)}%` }}
                          transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                          style={{ height: "100%", background: z.color, borderRadius: 99 }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : <EmptyChart message="Add location data to see zone breakdown" />}
            </Card>
          </motion.div>
        )}

        {/* ════ ENTRIES ════ */}
        {tab === "entries" && (
          <motion.div key="en" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <SH title={`All ${allEntries.length} donation entries`} sub="Live food redistribution tracking" />
            {loading ? (
              <div style={{ height: 200, borderRadius: 18 }} className="skeleton" />
            ) : allEntries.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--bark-muted)", fontSize: 14 }}>No entries found</div>
            ) : (
              <div style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Outfit',sans-serif" }}>
                  <thead>
                    <tr style={{ background: "var(--parchment)", borderBottom: "1.5px solid var(--border)" }}>
                      {["#", "Food Item", "Provider", "Receiver", "Qty", "Status"].map(h => (
                        <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--bark-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allEntries.map((e, i) => {
                      const sc       = statusStyle[e.status] || statusStyle.pending;
                      const provider = extractName(e.provider)   || "—"; // ✅ provider
                      const receiver = extractName(e.acceptedBy) || "—";
                      return (
                        <motion.tr key={e._id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }}
                          style={{ borderBottom: "1px solid var(--border)", transition: "background .15s", cursor: "default" }}
                          onMouseEnter={ev => ev.currentTarget.style.background = "var(--parchment)"}
                          onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                          <td style={{ padding: "11px 16px", color: "var(--bark-muted)", fontSize: 11 }}>#{String(i + 1).padStart(2, "0")}</td>
                          <td style={{ padding: "11px 16px", fontWeight: 700, color: "var(--bark)" }}>{e.title}</td>
                          <td style={{ padding: "11px 16px", color: "var(--bark-muted)" }}>{provider}</td>
                          <td style={{ padding: "11px 16px", color: receiver === "—" ? "var(--border-strong)" : "var(--leaf-dark)", fontWeight: receiver !== "—" ? 600 : 400 }}>{receiver}</td>
                          <td style={{ padding: "11px 16px", fontWeight: 700, color: "var(--saffron)", fontFamily: "'Playfair Display',serif", fontSize: 15 }}>{e.quantity}</td>
                          <td style={{ padding: "11px 16px" }}>
                            <span style={{ background: sc.bg, color: sc.color, borderRadius: 7, fontSize: 11, fontWeight: 700, padding: "4px 10px" }}>{sc.label}</span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ════ MY LISTINGS / PICKUPS ════ */}
        {tab === "mine" && user.role !== "admin" && (
          <motion.div key="mi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <SH title={user.role === "provider" ? "Your listings" : "Your pickups"} />
              <div style={{ display: "flex", gap: 6 }}>
                {[["grid", <FiGrid size={14} />], ["list", <FiList size={14} />]].map(([m, icon]) => (
                  <motion.button key={m} whileTap={{ scale: 0.9 }} onClick={() => setViewMode(m)}
                    style={{ padding: "7px 10px", borderRadius: 9, border: "1.5px solid var(--border)", background: viewMode === m ? "var(--parchment)" : "#fff", color: "var(--bark-muted)", cursor: "pointer", transition: "all .15s" }}>
                    {icon}
                  </motion.button>
                ))}
                <motion.button whileTap={{ scale: 0.9 }} onClick={fetchData}
                  style={{ padding: "7px 10px", borderRadius: 9, border: "1.5px solid var(--border)", background: "#fff", color: "var(--bark-muted)", cursor: "pointer" }}>
                  <FiRefreshCw size={14} />
                </motion.button>
              </div>
            </div>

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {[1, 2, 3].map(i => <div key={i} style={{ height: 220, borderRadius: 18 }} className="skeleton" />)}
              </div>
            ) : myFood.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 20, padding: "56px 32px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ fontSize: 52, marginBottom: 16 }}>🍽️</motion.div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 22, color: "var(--bark)", marginBottom: 8 }}>Nothing here yet</h3>
                <p style={{ fontSize: 13, color: "var(--bark-muted)", marginBottom: 20 }}>
                  {user.role === "provider" ? "Add your first food listing to get started" : "Accept a pickup from the listings page"}
                </p>
                <Link to={user.role === "provider" ? "/add-food" : "/listings"}>
                  <motion.button whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(232,129,10,.3)" }} whileTap={{ scale: 0.97 }}
                    style={{ background: "var(--saffron)", color: "#fff", border: "none", borderRadius: 11, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {user.role === "provider" ? "Add Food" : "Browse Listings"} <FiArrowRight size={13} />
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill,minmax(275px,1fr))" : "1fr", gap: 14 }}>
                {myFood.map((food, i) => (
                  <motion.div key={food._id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <FoodCard food={food} onUpdate={fetchData} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;