import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddFood from "./pages/AddFood";
import FoodListings from "./pages/FoodListings";

// 🔐 Protected Route
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 🌐 Main App Content
const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Toast notifications */}
      <Toaster position="top-right" />

      {/* Navbar only when logged in */}
      {user && <Navbar />}

      {/* Routes */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/listings"
          element={
            <PrivateRoute>
              <FoodListings />
            </PrivateRoute>
          }
        />

        <Route
          path="/add-food"
          element={
            <PrivateRoute>
              <AddFood />
            </PrivateRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="*"
          element={
            <Navigate to={user ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </>
  );
};

// 🚀 Root App
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;