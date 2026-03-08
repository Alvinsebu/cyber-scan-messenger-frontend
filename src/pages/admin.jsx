import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, ADMIN_EMAILS } from '../config';
import { useAuth } from '../authContext';
import { IoMdPower } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

// ── floating dot config ──────────────────────────────────────────
const DOTS = [
  { top: "15%", left: "10%", delay: 0 },
  { top: "70%", left: "5%", delay: 0.8 },
  { top: "30%", left: "88%", delay: 1.6 },
  { top: "80%", left: "80%", delay: 0.4 },
  { top: "50%", left: "50%", delay: 1.2 },
  { top: "10%", left: "60%", delay: 2.0 },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth ? useAuth() : { user: null, logout: () => { } };

  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 100;

  // Redirect to login if not signed in
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else if (user.email && !ADMIN_EMAILS.includes(user.email)) {
      // If user is logged in but not an admin, redirect to feeds
      navigate('/feeds', { replace: true });
    }
  }, [user, navigate]);

  // Fetch bullying data
  const fetchBullyingData = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = user?.access_token || JSON.parse(localStorage.getItem('user') || '{}').access_token;

      const response = await fetch(`${API_BASE_URL}/users/bullying?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data = await response.json();

      setUsers(data.users || []);
      setCurrentPage(data.current_page || 1);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bullying data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchBullyingData(1);
    }
  }, [user]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchBullyingData(newPage);
    }
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "#0d0f14" }}
    >
      {/* ── ambient glow circles ─────────────────────────── */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "-100px", left: "-100px",
          width: "600px", height: "600px",
          borderRadius: "50%",
          background: "hsl(180 100% 40% / 0.06)",
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: "-80px", right: "-80px",
          width: "500px", height: "500px",
          borderRadius: "50%",
          background: "hsl(180 100% 40% / 0.04)",
          filter: "blur(100px)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px", height: "800px",
          borderRadius: "50%",
          background: "hsl(220 100% 50% / 0.05)",
          filter: "blur(150px)",
          zIndex: 0,
        }}
      />

      {/* ── grid overlay ─────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(180 100% 50% / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(180 100% 50% / 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          zIndex: 0,
        }}
      />

      {/* ── floating dots ────────────────────────────────── */}
      {DOTS.map((dot, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none rounded-full"
          style={{
            top: dot.top, left: dot.left,
            width: "4px", height: "4px",
            backgroundColor: "hsl(180 100% 60%)",
            zIndex: 0,
          }}
          animate={{ y: [-20, 20], opacity: [0.2, 0.6, 0.2] }}
          transition={{
            duration: 4, repeat: Infinity,
            repeatType: "mirror", delay: dot.delay, ease: "easeInOut",
          }}
        />
      ))}

      {/* ── Header ─────────────────────────────────────── */}
      <div
        className="relative z-10"
        style={{
          background: "rgba(13,15,20,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid hsl(180 100% 50% / 0.12)",
          boxShadow: "0 4px 24px hsl(0 0% 0% / 0.4)",
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/feeds')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: "rgba(26,30,40,0.8)",
                  border: "1px solid hsl(180 100% 50% / 0.15)",
                  color: "hsl(215 20% 65%)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "hsl(180 100% 50% / 0.4)";
                  e.currentTarget.style.color = "hsl(180 100% 60%)";
                  e.currentTarget.style.boxShadow = "0 0 12px hsl(180 100% 50% / 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "hsl(180 100% 50% / 0.15)";
                  e.currentTarget.style.color = "hsl(215 20% 65%)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <IoArrowBack size={18} />
                <span className="hidden sm:inline">Back</span>
              </button>

              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "36px", height: "36px",
                    borderRadius: "10px",
                    background: "hsl(180 100% 50% / 0.10)",
                    border: "1px solid hsl(180 100% 50% / 0.20)",
                    boxShadow: "0 0 16px hsl(180 100% 50% / 0.12)",
                  }}
                >
                  <Shield size={20} color="hsl(180 100% 60%)" />
                </div>
                <h1
                  className="text-lg sm:text-2xl font-bold tracking-tight"
                  style={{ color: "#dde3ed" }}
                >
                  Admin Dashboard
                  <span
                    className="ml-2 text-sm font-normal"
                    style={{ color: "hsl(215 20% 45%)" }}
                  >
                    — Bullying Reports
                  </span>
                </h1>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap"
              style={{
                background: "hsl(0 80% 50% / 0.12)",
                border: "1px solid hsl(0 80% 50% / 0.25)",
                color: "hsl(0 80% 70%)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "hsl(0 80% 50% / 0.22)";
                e.currentTarget.style.boxShadow = "0 0 16px hsl(0 80% 60% / 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "hsl(0 80% 50% / 0.12)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <IoMdPower size={18} />
              <span className="sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Stats Card ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6"
          style={{
            background: "rgba(17,20,28,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid hsl(180 100% 50% / 0.14)",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: "0 0 30px hsl(180 100% 50% / 0.06), 0 8px 32px hsl(0 0% 0% / 0.4)",
          }}
        >
          {/* top glow line */}
          <div
            className="absolute top-0 left-6 right-6 h-px pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(180 100% 50% / 0.4), transparent)",
            }}
          />
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Users", value: total },
              { label: "Current Page", value: currentPage },
              { label: "Total Pages", value: totalPages },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs sm:text-sm mb-1" style={{ color: "hsl(215 20% 45%)" }}>{stat.label}</p>
                <p
                  className="text-2xl sm:text-3xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, hsl(180 100% 55%), hsl(180 100% 70%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Error Message ─────────────────────────────── */}
        {error && (
          <div
            className="px-4 py-3 rounded-xl mb-6 text-sm"
            style={{
              background: "hsl(0 80% 50% / 0.08)",
              border: "1px solid hsl(0 80% 50% / 0.3)",
              color: "hsl(0 80% 70%)",
            }}
          >
            <p className="font-bold mb-1">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* ── Table Card ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden"
          style={{
            background: "rgba(17,20,28,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid hsl(180 100% 50% / 0.14)",
            borderRadius: "14px",
            boxShadow: "0 0 30px hsl(180 100% 50% / 0.06), 0 8px 32px hsl(0 0% 0% / 0.4)",
          }}
        >
          {/* top glow line */}
          <div
            className="absolute top-0 left-6 right-6 h-px pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(180 100% 50% / 0.4), transparent)",
            }}
          />

          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 gap-4">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2"
                style={{ borderColor: "hsl(180 100% 55%)" }}
              ></div>
              <p className="text-sm" style={{ color: "hsl(215 20% 45%)" }}>Loading data...</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                {users.length === 0 ? (
                  <div className="px-4 py-10 text-center" style={{ color: "hsl(215 20% 40%)" }}>
                    No users found
                  </div>
                ) : (
                  <div
                    className="divide-y"
                    style={{ borderColor: "hsl(180 100% 50% / 0.08)" }}
                  >
                    {users.map((user, index) => {
                      const count = user.bullyingCommentCount || 0;
                      const isBlocked = count > 5;

                      return (
                        <div
                          key={index}
                          className="p-4 transition-colors duration-150"
                          style={{ borderBottom: "1px solid hsl(180 100% 50% / 0.07)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(26,30,40,0.5)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="text-xs mb-1" style={{ color: "hsl(215 20% 40%)" }}>
                                #{(currentPage - 1) * limit + index + 1}
                              </div>
                              <div className="text-base font-semibold" style={{ color: "#dde3ed" }}>
                                {user.username}
                              </div>
                            </div>
                            <span
                              className="px-2 py-1 text-xs font-semibold rounded-full"
                              style={
                                isBlocked
                                  ? { background: "hsl(0 80% 50% / 0.15)", color: "hsl(0 80% 70%)", border: "1px solid hsl(0 80% 50% / 0.3)" }
                                  : { background: "hsl(140 70% 40% / 0.15)", color: "hsl(140 70% 65%)", border: "1px solid hsl(140 70% 40% / 0.3)" }
                              }
                            >
                              {isBlocked ? 'Blocked' : 'Open'}
                            </span>
                          </div>
                          <div className="space-y-1 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>Bullying Comments:</span>
                              <span className="text-sm font-bold" style={{ color: "#dde3ed" }}>{count}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>Bullying Messages:</span>
                              <span className="text-sm font-bold" style={{ color: "#dde3ed" }}>{user.bullyingMessageCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs" style={{ color: "hsl(215 20% 45%)" }}>Total Bullying:</span>
                              <span className="text-sm font-bold" style={{ color: "hsl(180 100% 60%)" }}>{user.totalBullyingCount || 0}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid hsl(180 100% 50% / 0.12)" }}>
                      {['#', 'Username', 'Bullying Comment Count', 'Bullying Message Count', 'Total Bullying Count', 'Status'].map((head) => (
                        <th
                          key={head}
                          className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{
                            color: "hsl(180 100% 60%)",
                            background: "rgba(13,15,20,0.6)",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-10 text-center text-sm"
                          style={{ color: "hsl(215 20% 40%)" }}
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => {
                        const count = user.bullyingCommentCount || 0;
                        const isBlocked = count > 5;

                        return (
                          <tr
                            key={index}
                            className="transition-colors duration-150"
                            style={{ borderBottom: "1px solid hsl(180 100% 50% / 0.07)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(26,30,40,0.5)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "hsl(215 20% 40%)" }}>
                              {(currentPage - 1) * limit + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold" style={{ color: "#dde3ed" }}>
                                {user.username}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold" style={{ color: "#dde3ed" }}>
                                {count}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold" style={{ color: "#dde3ed" }}>
                                {user.bullyingMessageCount || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className="text-sm font-semibold"
                                style={{ color: "hsl(180 100% 60%)" }}
                              >
                                {user.totalBullyingCount || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className="px-3 py-1 inline-flex text-xs font-semibold rounded-full"
                                style={
                                  isBlocked
                                    ? { background: "hsl(0 80% 50% / 0.15)", color: "hsl(0 80% 70%)", border: "1px solid hsl(0 80% 50% / 0.3)" }
                                    : { background: "hsl(140 70% 40% / 0.15)", color: "hsl(140 70% 65%)", border: "1px solid hsl(140 70% 40% / 0.3)" }
                                }
                              >
                                {isBlocked ? 'Blocked' : 'Open'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="px-4 sm:px-6 py-4 flex items-center justify-between"
                  style={{ borderTop: "1px solid hsl(180 100% 50% / 0.10)" }}
                >
                  {/* Mobile pagination */}
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                      style={
                        currentPage === 1
                          ? { background: "rgba(26,30,40,0.4)", color: "hsl(215 20% 30%)", border: "1px solid hsl(180 100% 50% / 0.07)", cursor: "not-allowed" }
                          : { background: "rgba(26,30,40,0.8)", color: "hsl(215 20% 65%)", border: "1px solid hsl(180 100% 50% / 0.15)", cursor: "pointer" }
                      }
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                      style={
                        currentPage === totalPages
                          ? { background: "rgba(26,30,40,0.4)", color: "hsl(215 20% 30%)", border: "1px solid hsl(180 100% 50% / 0.07)", cursor: "not-allowed" }
                          : { background: "rgba(26,30,40,0.8)", color: "hsl(215 20% 65%)", border: "1px solid hsl(180 100% 50% / 0.15)", cursor: "pointer" }
                      }
                    >
                      Next
                    </button>
                  </div>

                  {/* Desktop pagination */}
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm" style={{ color: "hsl(215 20% 45%)" }}>
                        Showing page <span className="font-semibold" style={{ color: "#dde3ed" }}>{currentPage}</span> of{' '}
                        <span className="font-semibold" style={{ color: "#dde3ed" }}>{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="inline-flex rounded-lg overflow-hidden gap-1">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                          style={
                            currentPage === 1
                              ? { background: "rgba(26,30,40,0.4)", color: "hsl(215 20% 30%)", border: "1px solid hsl(180 100% 50% / 0.07)", cursor: "not-allowed" }
                              : { background: "rgba(26,30,40,0.8)", color: "hsl(215 20% 65%)", border: "1px solid hsl(180 100% 50% / 0.15)", cursor: "pointer" }
                          }
                          onMouseEnter={(e) => { if (currentPage !== 1) { e.currentTarget.style.borderColor = "hsl(180 100% 50% / 0.4)"; e.currentTarget.style.color = "hsl(180 100% 60%)"; } }}
                          onMouseLeave={(e) => { if (currentPage !== 1) { e.currentTarget.style.borderColor = "hsl(180 100% 50% / 0.15)"; e.currentTarget.style.color = "hsl(215 20% 65%)"; } }}
                        >
                          Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                style={
                                  pageNum === currentPage
                                    ? {
                                      background: "hsl(180 100% 50% / 0.15)",
                                      border: "1px solid hsl(180 100% 50% / 0.4)",
                                      color: "hsl(180 100% 65%)",
                                      boxShadow: "0 0 10px hsl(180 100% 50% / 0.2)",
                                      cursor: "default",
                                    }
                                    : {
                                      background: "rgba(26,30,40,0.8)",
                                      border: "1px solid hsl(180 100% 50% / 0.15)",
                                      color: "hsl(215 20% 65%)",
                                      cursor: "pointer",
                                    }
                                }
                              >
                                {pageNum}
                              </button>
                            );
                          } else if (
                            pageNum === currentPage - 2 ||
                            pageNum === currentPage + 2
                          ) {
                            return (
                              <span
                                key={pageNum}
                                className="px-3 py-2 text-sm"
                                style={{ color: "hsl(215 20% 40%)" }}
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                          style={
                            currentPage === totalPages
                              ? { background: "rgba(26,30,40,0.4)", color: "hsl(215 20% 30%)", border: "1px solid hsl(180 100% 50% / 0.07)", cursor: "not-allowed" }
                              : { background: "rgba(26,30,40,0.8)", color: "hsl(215 20% 65%)", border: "1px solid hsl(180 100% 50% / 0.15)", cursor: "pointer" }
                          }
                          onMouseEnter={(e) => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = "hsl(180 100% 50% / 0.4)"; e.currentTarget.style.color = "hsl(180 100% 60%)"; } }}
                          onMouseLeave={(e) => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = "hsl(180 100% 50% / 0.15)"; e.currentTarget.style.color = "hsl(215 20% 65%)"; } }}
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
