"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthDebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Try to get the session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      setSessionInfo({
        hasSession: !!data.session,
        sessionDetails: data.session
          ? {
              user: {
                id: data.session.user.id,
                email: data.session.user.email,
                lastSignInAt: data.session.user.last_sign_in_at,
              },
              expiresAt: data.session.expires_at,
              tokenDetails: {
                accessToken: data.session.access_token
                  ? "Present (not showing for security)"
                  : "Not present",
                refreshToken: data.session.refresh_token
                  ? "Present (not showing for security)"
                  : "Not present",
              },
            }
          : null,
      });
    } catch (err) {
      console.error("Error checking auth:", err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setError(null);
      setSuccessMessage(null);

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setSuccessMessage("Successfully signed out");
      checkAuth(); // Refresh the session info
    } catch (err) {
      console.error("Error signing out:", err);
      setError(
        `Error signing out: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const handleResetAuth = async () => {
    try {
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();

      // Reload the page
      window.location.href = "/login";
    } catch (err) {
      console.error("Error resetting auth:", err);
      setError(
        `Error resetting auth: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Supabase Authentication Debug
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Information</h2>

          {loading ? (
            <p>Loading session information...</p>
          ) : (
            <div>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mb-4">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>

              <div className="flex space-x-4 mt-4">
                <button
                  onClick={checkAuth}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Refresh Session Info
                </button>

                {sessionInfo?.hasSession && (
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                )}

                <button
                  onClick={handleResetAuth}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                >
                  Reset Auth (Clear Storage)
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>

          <div className="flex flex-wrap gap-4">
            <a
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Login Page
            </a>
            <a
              href="/auth-test"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Auth Test Page
            </a>
            <a
              href="/blog/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Blog Dashboard
            </a>
            <a
              href="/blog"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Blog Home
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>

          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Go to the{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Login Page
              </a>{" "}
              and sign in.
            </li>
            <li>
              Return to this page and click "Refresh Session Info" to verify you
              have a valid session.
            </li>
            <li>
              If you see a session, try visiting the{" "}
              <a
                href="/blog/dashboard"
                className="text-blue-600 hover:underline"
              >
                Blog Dashboard
              </a>
              .
            </li>
            <li>
              If you still have issues, try the "Reset Auth" button to clear all
              storage and start fresh.
            </li>
            <li>Make sure cookies are enabled in your browser.</li>
            <li>
              Try using private/incognito mode if you continue to have issues.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
