import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { AlertCircle, Users, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface Complaint {
  id: string;
  description: string;
  category: string;
  status: string;
  urgency_score: number;
  created_at: string;
  user: {
    email: string;
    profile: {
      full_name: string;
    };
  };
}

interface OnlineUser {
  id: string;
  email: string;
  full_name: string;
  last_seen: string;
}

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchComplaints();
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 30000); // Update online users every 30 seconds

    return () => clearInterval(interval);
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      let query = supabase
        .from("complaints")
        .select(
          `
          *,
          user:user_id (
            email,
            profile:profiles (
              full_name
            )
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setComplaints(data || []);
    } catch (error) {
      toast.error("Error fetching complaints");
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, last_seen")
        .gt("last_seen", fiveMinutesAgo);

      if (error) throw error;

      setOnlineUsers(data || []);
    } catch (error) {
      console.error("Error fetching online users:", error);
    }
  };

  const updateComplaintStatus = async (
    complaintId: string,
    newStatus: string,
  ) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: newStatus })
        .eq("id", complaintId);

      if (error) throw error;

      toast.success("Complaint status updated");
      fetchComplaints();
    } catch (error) {
      toast.error("Error updating complaint status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "endorsed":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-purple-100 text-purple-800";
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Clock className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats */}
        <div className="col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Complaints
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {complaints.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {complaints.filter((c) => c.status === "pending").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {complaints.filter((c) => c.status === "ongoing").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {complaints.filter((c) => c.status === "closed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Online Users */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Online Users
          </h3>
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="ml-2 text-sm text-gray-600">
                  {user.full_name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Complaints Management
          </h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Complaints</option>
            <option value="pending">Pending</option>
            <option value="endorsed">Endorsed</option>
            <option value="ongoing">Ongoing</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-500 mr-2">
                      Reported by: {complaint.user.profile.full_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({format(new Date(complaint.created_at), "PPp")})
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-800 mb-2">
                    {complaint.description}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        complaint.status,
                      )}`}
                    >
                      {complaint.status}
                    </span>
                    <span className="text-sm font-medium">
                      Category: {complaint.category}
                    </span>
                    <span className="text-sm font-medium">
                      Urgency: {Math.round(complaint.urgency_score * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {complaint.status === "pending" && (
                    <button
                      onClick={() =>
                        updateComplaintStatus(complaint.id, "endorsed")
                      }
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Endorse
                    </button>
                  )}
                  {complaint.status === "endorsed" && (
                    <button
                      onClick={() =>
                        updateComplaintStatus(complaint.id, "ongoing")
                      }
                      className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Start Work
                    </button>
                  )}
                  {complaint.status === "ongoing" && (
                    <button
                      onClick={() =>
                        updateComplaintStatus(complaint.id, "closed")
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
