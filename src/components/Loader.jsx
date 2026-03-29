const Loader = () => (
  <div className="flex flex-col items-center justify-center h-64 gap-3">
    <div className="w-8 h-8 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin" />
    <p className="text-sm text-gray-400 font-medium">Loading...</p>
  </div>
);

export default Loader;