"use client";

import { auth } from "@/context/firebase";
import axiosInstance from "@/lib/axiosInstance";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const [otp, setOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [showLoginOTP, setShowLoginOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();


  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isVerifying) return;
    setIsVerifying(true);

    try {
      const rawPendingGoogleUser = localStorage.getItem("pendingGoogleUser");
      const pendingGoogleUser = rawPendingGoogleUser
        ? (JSON.parse(rawPendingGoogleUser) as { email?: string } | null)
        : null;

      console.log("FIREBASE USER:", auth.currentUser);
      console.log("PENDING EMAIL:", sessionStorage.getItem("pendingGoogleEmail"));
      console.log("PENDING GOOGLE USER:", rawPendingGoogleUser);
      console.log("VERIFY BUTTON CLICKED");

      const email =
        pendingGoogleUser?.email ||
        auth.currentUser?.email ||
        sessionStorage.getItem("pendingGoogleEmail");

      if (!email) {
        setOtpMessage("Google email not found. Please log in again.");
        return;
      }

      const response = await axiosInstance.post("/verify-login-history-otp", {
        email,
        otp,
      });

      console.log("OTP VERIFY API RESPONSE:", response.data);

      if (!response.data.success) {
        setOtpMessage(response.data.message || "OTP verification failed.");
        return;
      }

      const userResponse = await axiosInstance.get("/loggedinuser", {
        params: { email },
      });

      const userData = userResponse.data;
      console.log("USER DATA:", userData);

      if (!userData || !userData._id) {
        setOtpMessage("Failed to retrieve user data.");
        return;
      }

      setUser(userData);
      localStorage.setItem("twitter-user", JSON.stringify(userData));
      localStorage.setItem("isLoggedIn", "true");

      // Save login history
      try{
          await axiosInstance.post("/save-login-history", {
          userId: userData._id,
      });
    }catch(error){
            console.error("LOGIN HISTORY ERROR:",error);
    }
    
    localStorage.removeItem("pendingGoogleUser");
    sessionStorage.removeItem("pendingGoogleEmail");
    
      setShowLoginOTP(false);
      setOtp("");
      setOtpMessage("Login successful! Redirecting...");
      console.log("OTP VERIFIED - SETTING USER:", userData);

      window.location.replace("/");
    } catch (error) {
      const otpError = error as {
        response?: { status?: number; data?: { message?: string; error?: string } };
        message?: string;
      };

      console.log("OTP ERROR STATUS:", otpError.response?.status);
      console.log("OTP ERROR DATA:", otpError.response?.data);
      console.log("LOGIN ERROR:", error);

      setOtpMessage(
        otpError.response?.data?.message ||
          otpError.response?.data?.error ||
          otpError.message ||
          "OTP verification failed."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-white p-8 rounded-xl w-80">
       
          <form onSubmit={handleOtpSubmit}>
            <h1 className="text-2xl font-bold mb-4 text-black">
              Email OTP Verification
            </h1>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border p-3 w-full text-black mb-4"
            />

            <button
              type="submit"
              disabled={isVerifying}
              className="bg-blue-500 text-white p-3 w-full rounded hover:bg-blue-600"
            >
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="text-black mt-3">{otpMessage}</p>
          </form>
      </div>
    </div>
  );
}
   

