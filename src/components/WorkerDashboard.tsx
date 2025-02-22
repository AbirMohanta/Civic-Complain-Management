import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { PenTool as Tool, Clock, CheckCircle } from "lucide-react";
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

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ongoing");

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      let query = supabase
        .from("complaints")
        .select(`
          *,
          user:user_id (
            email,
            profile:profiles (
              full_name
            )
          )
        `)
        .eq("status", filter)
        .order("urgency_score", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setComplaints(data || []);
    } catch (error) {
      toast.error("Error fetching assigned tasks");
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: newStatus })
        .eq("id", complaintId);

      if (error) throw error;

      toast.success("Task status updated");
      fetchComplaints();
    } catch (error) {
      toast.error("Error updating task status");
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
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Tool className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Assigned Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{complaints.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
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
              <p className="text-sm font-medium text-gray-500">Completed Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {
                  complaints.filter(
                    (c) =>
                      c.status === "closed" &&
                      new Date(c.created_at).toDateString() === new Date().toDateString(),
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="ongoing">In Progress</option>
              <option value="closed">Completed</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="p-6 hover:bg-gray-50">
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
                    <span className="text-sm font-medium">
                      Category: {complaint.category}
                    </span>
                    <span className="text-sm font-medium text-red-600">
                      Urgency: {Math.round(complaint.urgency_score * 100)}%
                    </span>
                  </div>
                </div>
                {complaint.status === "ongoing" && (
                  <button
                    onClick={() => updateComplaintStatus(complaint.id, "closed")}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))}

          {complaints.length === 0 && (
            <div className="p-6 text-center text-gray-500">No tasks found</div>
          )}
        </div>
      </div>
    </div>
  );
}