import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import OfficerDashboard from "./components/OfficerDashboard";
import WorkerDashboard from "./components/WorkerDashboard";
import NewComplaint from "./components/NewComplaint";
import Profile from "./components/Profile";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
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
                path="/officer-dashboard"
                element={
                  <PrivateRoute officerOnly>
                    <OfficerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/worker-dashboard"
                element={
                  <PrivateRoute workerOnly>
                    <WorkerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/new-complaint"
                element={
                  <PrivateRoute>
                    <NewComplaint />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
