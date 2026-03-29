import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import FoodCard from "../components/FoodCard";
import Loader from "../components/Loader";
import { FiSearch } from "react-icons/fi";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Completed", value: "completed" },
];

const FoodListings = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/food");
      setFoods(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchFoods(); }, []);

  const filtered = foods
    .filter(f => filter === "all" || f.status === filter)
    .filter(f =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.location.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 30 }} className="text-gray-900 mb-1">
          Food Listings
        </h1>
        <p className="text-gray-400 text-sm">Browse and accept available surplus food near you</p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-5">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search by food name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: "1.5px solid #e5e7eb", borderRadius: 12 }}
          className="w-full pl-10 pr-4 py-3 text-sm bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:border-green-500 transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-7 flex-wrap">
        {FILTERS.map(({ label, value }) => {
          const count = value === "all" ? foods.length : foods.filter(f => f.status === value).length;
          return (
            <motion.button key={value} whileTap={{ scale: 0.96 }}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${filter === value ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              style={{ border: filter === value ? "none" : "1px solid #e5e7eb" }}>
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${filter === value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {loading ? <Loader /> : (
        filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center" style={{ border: "1px solid #e5e7eb" }}>
            <p className="text-4xl mb-3">🔍</p>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700 }} className="text-gray-700 text-lg">No results found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((food, i) => (
                <motion.div key={food._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.06 }}>
                  <FoodCard food={food} onUpdate={fetchFoods} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )
      )}
    </div>
  );
};

export default FoodListings;