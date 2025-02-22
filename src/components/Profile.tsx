import React, { useEffect, useState } from "react";
import { User2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  department?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFullName(data.full_name || "");
    } catch (error) {
      toast.error("Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      fetchProfile();
    } catch (error) {
      toast.error("Error updating profile");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-8">
          <User2 className="h-8 w-8 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
        </div>

        <form onSubmit={updateProfile} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <input
              type="text"
              disabled
              value={profile?.role || "citizen"}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {profile?.department && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <input
                type="text"
                disabled
                value={profile.department}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}
