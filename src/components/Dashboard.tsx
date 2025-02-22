import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
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
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchComplaints();
  }, [user, navigate]);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setComplaints(data || []);
    } catch (error) {
      toast.error("Error fetching complaints");
    } finally {
      setLoading(false);
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

  const getUrgencyColor = (score: number) => {
    if (score >= 0.7) return "text-red-600";
    if (score >= 0.4) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Clock className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Your Complaints</h1>
        <button
          onClick={() => navigate("/new-complaint")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Complaint
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No complaints found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-800 mb-2">
                    {complaint.description}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
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
                  </div>
                </div>
                <div className="flex items-center">
                  <CheckCircle
                    className={`h-6 w-6 ${getUrgencyColor(complaint.urgency_score)}`}
                  />
                  <span className="ml-2 text-sm font-medium">
                    Urgency: {Math.round(complaint.urgency_score * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
