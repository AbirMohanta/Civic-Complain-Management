import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const ROLES = ["citizen", "officer", "worker"] as const;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("citizen");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password");
        }
        throw error;
      }

      if (data?.user) {
        // Verify user role
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role, department")
          .eq("user_id", data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData.role !== role) {
          throw new Error(`Invalid role. You are registered as a ${profileData.role}`);
        }

        // Update last seen
        await supabase
          .from("profiles")
          .update({ last_seen: new Date().toISOString() })
          .eq("user_id", data.user.id);

        toast.success("Signed in successfully");
        
        // Redirect based on role
        switch (role) {
          case "officer":
            navigate("/officer-dashboard");
            break;
          case "worker":
            navigate("/worker-dashboard");
            break;
          default:
            navigate("/dashboard");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error signing in");
      // Sign out on error to clean up any partial auth state
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-8">
          <LogIn className="h-8 w-8 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}