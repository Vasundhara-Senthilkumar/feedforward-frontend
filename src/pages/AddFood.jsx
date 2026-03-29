import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { FiMapPin, FiClock, FiPackage, FiFileText, FiArrowRight, FiNavigation } from "react-icons/fi";

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 700,
        color: "var(--bark-muted)",
        marginBottom: 7,
      }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <Icon
        style={{
          position: "absolute",
          left: 13,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
        size={15}
      />
      {children}
    </div>
  </div>
);

const AddFood = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    quantity: "",
    expiryTime: "",
    location: "",
    foodType: "veg",
  });

  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({});
  const [locLoading, setLocLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fc = (k) => ({
    onFocus: () => setFocused((p) => ({ ...p, [k]: true })),
    onBlur: () => setFocused((p) => ({ ...p, [k]: false })),
  });

  const iStyle = (k, extraPaddingRight = 14) => ({
    width: "100%",
    paddingLeft: 40,
    paddingRight: extraPaddingRight,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    background: "#fff",
    color: "var(--text)",
    border: `1.5px solid ${focused[k] ? "var(--saffron)" : "var(--border)"}`,
    borderRadius: 11,
    transition: "border-color .18s",
    boxSizing: "border-box",
  });

  // ✅ GPS auto-fill handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode using OpenStreetMap (free, no API key needed)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          const address = data.display_name || `${latitude}, ${longitude}`;
          setForm((prev) => ({ ...prev, location: address }));
          toast.success("Location detected!");
        } catch {
          // Fallback to raw coords if reverse geocoding fails
          setForm((prev) => ({
            ...prev,
            location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          }));
          toast.success("Location detected (coordinates)!");
        }

        setLocLoading(false);
      },
      (err) => {
        setLocLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied");
        } else {
          toast.error("Unable to retrieve location");
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/food", form);
      toast.success("Food listing added! 🍽️");
      navigate("/listings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding food");
    }
    setLoading(false);
  };

  return (
    <div className="page-enter" style={{ maxWidth: 600, margin: "0 auto", padding: "28px 20px 60px" }}>
      <div>
        <h1 style={{ fontSize: 30, marginBottom: 5 }}>Add Food Listing</h1>
        <p style={{ marginBottom: 28 }}>Share your surplus food with NGOs and volunteers nearby</p>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            borderRadius: 22,
            border: "1.5px solid var(--border)",
            padding: "28px 26px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <Field label="Food Title" icon={FiPackage} fkey="title">
            <input type="text" name="title" value={form.title} onChange={handleChange} style={iStyle("title")} {...fc("title")} required />
          </Field>

          <Field label="Description" icon={FiFileText} fkey="desc">
            <textarea name="description" value={form.description} onChange={handleChange} style={iStyle("desc")} {...fc("desc")} />
          </Field>

          <Field label="Quantity" icon={FiPackage} fkey="qty">
            <input type="text" name="quantity" value={form.quantity} onChange={handleChange} style={iStyle("qty")} {...fc("qty")} required />
          </Field>

          {/* ✅ Location field with GPS button */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--bark-muted)", marginBottom: 7 }}>
              Location
            </label>
            <div style={{ position: "relative" }}>
              <FiMapPin
                size={15}
                style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              />
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter address or use GPS"
                style={iStyle("loc", 44)} // extra right padding for the button
                {...fc("loc")}
                required
              />
              {/* GPS button inside the input */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locLoading}
                title="Detect my location"
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: locLoading ? "var(--border)" : "var(--saffron)",
                  border: "none",
                  borderRadius: 7,
                  padding: "5px 7px",
                  cursor: locLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background .18s",
                }}
              >
                <FiNavigation size={13} color="#fff" />
              </button>
            </div>
            <p style={{ fontSize: 11, color: "var(--bark-muted)", marginTop: 5 }}>
              📍 Tap the <FiNavigation size={10} /> button to auto-fill your current location
            </p>
          </div>

          <Field label="Expiry Time" icon={FiClock} fkey="exp">
            <input type="datetime-local" name="expiryTime" value={form.expiryTime} onChange={handleChange} style={iStyle("exp")} {...fc("exp")} required />
          </Field>

          <button
            type="submit"
            disabled={loading}
            style={{ padding: "14px", background: "var(--saffron)", color: "#fff", borderRadius: 12, border: "none", fontWeight: 700, display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}
          >
            {loading ? "Adding..." : <> Add Food <FiArrowRight size={14} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFood;