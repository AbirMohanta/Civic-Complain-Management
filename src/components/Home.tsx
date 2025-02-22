import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Users, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Your Voice Matters in</span>
                  <span className="block text-blue-600">
                    Building Better Communities
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Report civic issues, track their progress, and be part of the
                  solution. Our platform connects citizens with local
                  authorities for faster resolution of community problems.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  {!user ? (
                    <>
                      <div className="rounded-md shadow">
                        <Link
                          to="/register"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                        >
                          Get Started
                        </Link>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <Link
                          to="/login"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                        >
                          Sign In
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-md shadow">
                      <Link
                        to="/dashboard"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                      >
                        Go to Dashboard
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to report civic issues
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Easy Reporting
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Submit complaints easily with our user-friendly interface.
                  Categorize issues and provide detailed descriptions.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Activity className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Real-time Tracking
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Track the status of your complaints in real-time. Get updates
                  as your issue progresses through resolution.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Direct Communication
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Connect directly with local authorities and workers assigned
                  to resolve your issues.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Smart Prioritization
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  AI-powered system to prioritize urgent issues and ensure
                  faster resolution of critical problems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
