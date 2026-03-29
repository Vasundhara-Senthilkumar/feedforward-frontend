import { motion } from "framer-motion";

const styles = {
  primary: "bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200",
  secondary: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-200",
  danger: "bg-red-500 text-white hover:bg-red-600",
  outline: "border border-green-600 text-green-600 hover:bg-green-50",
  ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-800",
};

const Button = ({ children, onClick, type = "button", variant = "primary", disabled = false, fullWidth = false }) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.01 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      ${fullWidth ? "w-full" : ""} 
      ${styles[variant]}
      px-5 py-2.5 rounded-xl text-sm font-semibold
      transition-colors duration-150
      disabled:opacity-40 disabled:cursor-not-allowed
      flex items-center justify-center gap-2
    `}
  >
    {children}
  </motion.button>
);

export default Button;