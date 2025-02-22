import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { analyzeComplaintUrgency } from "../lib/mistral";
import toast from "react-hot-toast";

const categories = [
  "water",
  "electricity",
  "roads",
  "sanitation",
  "other",
] as const;

export default function NewComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("water");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const urgencyScore = await analyzeComplaintUrgency(description);

      const { error } = await supabase.from("complaints").insert([
        {
          user_id: user.id,
          description,
          category,
          urgency_score: urgencyScore,
        },
      ]);

      if (error) throw error;

      toast.success("Complaint submitted successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error submitting complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-8">
          <AlertTriangle className="h-8 w-8 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">
            Submit New Complaint
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as (typeof categories)[number])
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Please describe your complaint in detail..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Send className="h-5 w-5 mr-2" />
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
}
