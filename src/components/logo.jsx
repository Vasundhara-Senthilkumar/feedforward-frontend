import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const BowlIcon = ({ size = 36 }) => (
  <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 2.5 C7.5 3.8 9 4.2 9 5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 1.5 C11 2.8 12.5 3.2 12.5 4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9.5 H19" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M4 9.5 C4 14.5 7.2 17.5 11 17.5 C14.8 17.5 18 14.5 18 9.5 Z" fill="white"/>
    <path d="M8 17.5 L8.8 20 H13.2 L14 17.5" fill="white"/>
    <path d="M7 20 H15" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const Logo = ({ variant = "light", size = "md", animate = true, to = "/dashboard" }) => {
  const sizes = {
    sm:  { circle: 34, title: 17, sub: 9  },
    md:  { circle: 42, title: 21, sub: 10 },
    lg:  { circle: 56, title: 28, sub: 11 },
    xl:  { circle: 68, title: 34, sub: 12 },
  };
  const s = sizes[size];

  const textColor   = variant === "dark" ? "#ffffff"                 : "var(--bark)";
  const subColor    = variant === "dark" ? "rgba(255,255,255,0.45)" : "var(--bark-muted)";

  const inner = (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <motion.div
        whileHover={animate ? { rotate: [0, -8, 8, -4, 0], scale: 1.08 } : {}}
        transition={{ duration: 0.5 }}
        style={{
          width: s.circle, height: s.circle,
          borderRadius: "50%",
          background: "var(--saffron)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 3px 12px rgba(232,129,10,0.35)",
        }}
      >
        <BowlIcon size={s.circle} />
      </motion.div>

      <div style={{ lineHeight: 1.15 }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 800,
          fontSize: s.title,
          color: textColor,
          letterSpacing: "-0.4px",
          lineHeight: 1,
        }}>
          Feed<span style={{ color: "var(--saffron)" }}>Fwd</span>
        </div>
        <div style={{
          fontSize: s.sub,
          fontWeight: 500,
          color: subColor,
          letterSpacing: "0.04em",
          marginTop: 3,
        }}>
          Reducing waste, feeding lives
        </div>
      </div>
    </div>
  );

  if (!to) return inner;
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  );
};

export default Logo;
