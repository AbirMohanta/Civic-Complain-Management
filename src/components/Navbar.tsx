import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, LogOut, User, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <AlertCircle className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">CivicCare</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                >
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/new-complaint"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  New Complaint
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
              >
                <User className="h-5 w-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
