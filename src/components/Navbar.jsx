import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FiLogOut, FiGrid, FiList, FiPlus, FiMenu, FiX } from "react-icons/fi";
import Logo from "./Logo";

const navLinks = (role) => [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/listings", label: "Listings", icon: FiList },
  ...(role === "provider" ? [{ to: "/add-food", label: "Add Food", icon: FiPlus }] : []),
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const active = (path) => location.pathname === path;

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          borderBottom: "1.5px solid var(--border)",
          background: "rgba(253,250,244,.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-5 h-[62px] flex items-center justify-between">
          {/* Logo */}
          <Logo variant="light" size="sm" to="/dashboard" />

          {/* Desktop Nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks(user.role).map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}>
                  <motion.div
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      background: active(to) ? "var(--saffron-light)" : "transparent",
                      color: active(to) ? "var(--saffron-dark)" : "var(--bark-muted)",
                      border: active(to) ? "1px solid rgba(232,129,10,.2)" : "1px solid transparent",
                      borderRadius: 10,
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors hover:text-bark"
                  >
                    <Icon size={14} />
                    {label}
                    {active(to) && (
                      <motion.div
                        layoutId="nav-pill"
                        style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--saffron)" }}
                      />
                    )}
                  </motion.div>
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          {user && (
            <div className="flex items-center gap-3">
              {/* User chip */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{ background: "var(--parchment)", border: "1.5px solid var(--border)", borderRadius: 99 }}
                className="hidden md:flex items-center gap-2 pl-1 pr-3 py-1"
              >
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--saffron)", color: "#fff", fontSize: 12, fontWeight: 700 }}
                  className="flex items-center justify-center flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--bark)" }}>{user.name}</p>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "var(--leaf)", textTransform: "capitalize" }}>{user.role}</p>
                </div>
              </motion.div>

              {/* Logout */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setLogoutHover(true)}
                onHoverEnd={() => setLogoutHover(false)}
                onClick={handleLogout}
                style={{
                  background: logoutHover ? "var(--red-light)" : "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: logoutHover ? "var(--red)" : "var(--bark-muted)",
                }}
                className="p-2 transition-colors"
              >
                <FiLogOut size={15} />
              </motion.button>

              {/* Mobile toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="md:hidden p-2"
                style={{ color: "var(--bark)" }}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </motion.button>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && user && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ borderTop: "1px solid var(--border)", background: "rgba(253,250,244,.98)", overflow: "hidden" }}
            >
              <div className="px-5 py-3 flex flex-col gap-1">
                {navLinks(user.role).map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
                    <div style={{ color: active(to) ? "var(--saffron)" : "var(--bark-muted)", background: active(to) ? "var(--saffron-light)" : "transparent", borderRadius: 10 }}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold">
                      <Icon size={15} />{label}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Navbar;
