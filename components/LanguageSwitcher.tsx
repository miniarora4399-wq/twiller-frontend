"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";



const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "hi", name: "Hindi" },
    { code: "pt", name: "Portuguese" },
    { code: "zh", name: "Chinese" },
    { code: "fr", name: "French" },
] as const;

type LanguageCode = (typeof languages)[number]["code"];

const isLanguageCode = (value: string): value is LanguageCode =>
    languages.some((language) => language.code === value);

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const [selected, setSelected] = useState<LanguageCode>(language);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const {t} = useLanguage();
    
    

    const API = "http://localhost:5000";

    useEffect(() => {
        setSelected(language);
    }, [language]);

    async function sendOTP() {
        console.log("SEND OTP BUTTON CLICKED");

        setLoading(true);
        setMessage("");

        try {
            
                console.log("BEFORE FETCH");
                const response = await fetch(`${API}/language/send-otp`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email:"miniarora4399@gmail.com",language: selected }),
                });

                console.log("AFTER FETCH:", response.status);
                console.log("FETCH RESPONSE:", response);
                
                const data = await response.json();
        
                console.log("ERROR MESSAGE:", data.message);
                console.log("FULL RESPONSE:", JSON.stringify(data));

                if (!response.ok) {
                    throw new Error(data.message || "OTP send failed");
                }

                setOtpSent(true);
                setMessage(data.message);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function verifyOTP() {
        setLoading(true);
        setMessage("");
        
        console.log("API URL:", `${API}/language/send-otp`);
        console.log("Sending OTP request...");

        try {
            const response = await fetch(`${API}/language/verify-otp`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: "miniarora4399@gmail.com",
                    language: selected,
                    otp,
                }),
            });
            
            const data = await response.json();
            console.log("Response status:", response.status);
            console.log("Response data:", JSON.stringify(data, null, 2));

            if (!response.ok || !data.success) {
                localStorage.setItem("language",selected);
                alert("Language changed successfully!");
                window.location.reload();
                
            }
            else{
                throw new Error(data.message || "OTP verification failed");
            }

            setLanguage(selected);
            localStorage.setItem("language", selected);
            setOtp("");
            setOtpSent(false);
            setMessage("Language changed successfully");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="language-select">{t("language") || "Language" }</label>
            <select
                id="language-select"
                value={selected}
                onChange={(e) => setSelected(e.target.value as typeof selected)}
                className="block w-full rounded-md border 
                border-gray-300 bg-black px-2 py-1.5 
                text-sm text-white-900"
            
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>

            <button
                type="button"
                onClick={sendOTP}
                disabled={loading}
                className="rounded bg-blue-500 px-3 py-2 text-white disabled:opacity-50"
            >
                {loading ? "Processing..." : otpSent ? "Resend OTP" : (t("sendOtp") || "Send OTP")}
            </button>

            {otpSent && (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="border rounded p-2"
                    />
                    <button
                        type="button"
                        onClick={verifyOTP}
                        disabled={loading}
                        className="rounded bg-green-600 px-3 py-2 text-white disabled:opacity-50"
                    >
                        Verify
                    </button>
                </div>
            )}

            {message && <p className="text-sm text-gray-700">{message}</p>}
        </div>
    );
}