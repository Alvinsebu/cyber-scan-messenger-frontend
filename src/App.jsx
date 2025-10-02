
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Feed from "./pages/feed";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
         <Route path="/feeds" element={<Feed />} />
      </Routes>
    </div>
  );
}

export default App;
