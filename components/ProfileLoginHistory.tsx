"use client";

import {useEffect, useState} from "react";

type LoginRecord = {
    _id : string;
    browser : string;
    operatingSystem : string;
    device : string;
    ipAddress : string;
    loginAt : string;
}

type Props = {
    userId : string;
};

export default function ProfileLoginHistory({userId} : Props){
    const [history, setHistory] = useState<LoginRecord[] > ([]);
    const [loading,setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        async function loadHistory() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/login-history/${userId}`,
                    { signal: controller.signal, credentials: "include" }
                );

                if (!response.ok) {
                    throw new Error("Failed to load login history.");
                }

                const records: LoginRecord[] = await response.json();
                setHistory(records);
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : "Failed to load login history.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadHistory();
        return () => controller.abort();
    }, [userId]);

    if (loading) return <p>Loading login history...</p>;
    if (error) return <p role="alert">{error}</p>;

    return (
    <section className="w-full space-y-4">
      <h2 className="text-xl font-bold">Login History</h2>
      <p className="text-sm text-gray-500">
        View the browsers and devices used to access your account.
      </p>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="p-3">Date &amp; Time</th>
              <th className="p-3">Browser</th>
              <th className="p-3">Operating System</th>
              <th className="p-3">Device</th>
              <th className="p-3">IP Address</th>
            </tr>
          </thead>

          <tbody>
            {history.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="whitespace-nowrap p-3">
                  {new Date(item.loginAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}
                </td>
                <td className="p-3">{item.browser}</td>
                <td className="p-3">{item.operatingSystem}</td>
                <td className="p-3">{item.device}</td>
                <td className="p-3">{item.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length === 0 && (
        <p className="py-6 text-center text-gray-500">
          No login history found.
        </p>
      )}
    </section>
  );
}