
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Feed from "./pages/feed";
import Admin from "./pages/admin";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<div className="flex items-center justify-center min-h-screen"><Login /></div>} />
        <Route path="/register" element={<div className="flex items-center justify-center min-h-screen"><Register /></div>} />
         <Route path="/feeds" element={<Feed />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
