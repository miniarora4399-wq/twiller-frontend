"use client"

import React, { useRef,useState } from "react"
import axiosInstance from "@/lib/axiosInstance"
import { PartyPopper } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";


interface AudioTweetProps {
     onAudioUploaded : (url : string) => void;

}


export default function AudioTweet() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
    const { t } = useLanguage();
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [recordingStatus,setRecordingStatus] = useState("")
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);


    // IST time check between 2PM and 7PM

    const checkUploadTime =() =>{
        const now = new Date();

        const istTime = new Intl.DateTimeFormat("en-IN",{
            timeZone:"Asia/Kolkata",
            hour: "2-digit",
            minute:"2-digit",
            hour12:false,
        }).formatToParts(now);

        const hour = Number(
            istTime.find((part) => part.type ==="hour")?.value);

        const minute = Number(
            istTime.find((Part) => Part.type ==="minute")?.value);

        const currentMinutes = hour * 60 + minute;

        // 2 PM = 840 minutes
        // 7 PM = 1140 minutes
 
        return currentMinutes >= 840 && currentMinutes < 1140;
    };
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const mimeType = mediaRecorder.mimeType || "audio/webm";
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                setRecordedAudio(audioBlob);
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioPreview(audioUrl);

                const recordedFile = new File(
                    [audioBlob],
                    "recorded-voice.webm",
                    { type: mimeType }
                );
                handleFileChange(recordedFile);
                setRecordingStatus("Voice Recorded");
                stream.getTracks().forEach((track) => track.stop());
            };

            setIsRecording(true);
            mediaRecorder.start();
        } catch (error) {
            console.error("Error accessing microphone:", error);
            setMessage("Failed to access microphone.");
        }
    };
    
    const stopRecording = () => {
        
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        } 
        };
      
    

    const handleFileChange = (file : File) =>{
        setMessage("");

       // 100 MB limit
       const maxSize = 100 * 1024 * 1024;

       if(file.size > maxSize){
        setMessage("Audio file must not exceed 100 MB.");
        return;
       }

       // Duration check
       const audio = document.createElement("audio");
       const objectUrl = URL.createObjectURL(file);

       audio.preload = "metadata";

       audio.onloadedmetadata = () =>{
        URL.revokeObjectURL(objectUrl);

        if(audio.duration > 5 * 60){
            setMessage("Audio duration must not exceed 5 minutes.");
            return
        }

        setAudioFile(file);
        setMessage("Audio selected successfully.");
        
       };

       audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setMessage("Invalid audio file.");
       };

       audio.src = objectUrl;

    };

    const handleSelectAudio = (
        event: React.ChangeEvent<HTMLInputElement>) =>{
         
            const file = event.target.files?.[0];

            if(!file) return;

            handleFileChange(file);

        };

    // Send OTP
    const sendOTP = async () =>{
        console.log("Sending OTP for audio tweet");
        try{
            setLoading(true);
            setMessage("");
            
            if(!checkUploadTime()){
                setMessage("Audio tweets are allowed only between 2:00 PM and 7:00 PM");
                return;
            }
            if(!audioFile){
                setMessage("Please select an audio file or recorded file first.");
                return;
            }

            await axiosInstance.post("/audio/send-otp",{
                userEmail: "miniarora4399@gmail.com",
            });

            setOtpSent(true);
            setMessage("OTP sent to your registered email.");
        }
        catch(error:any)
        {
           setMessage(error?.response?.data?.message || "Failed to send OTP");
        }
        finally{
            setLoading(false);
        }

    };

    // OTP Verification
    const verifyOTP = async () =>{
        try{
            setLoading(true);
            setMessage("");

            await axiosInstance.post("/audio/verify-otp",{
                userEmail: "miniarora4399@gmail.com",
                generatedOTP: otp,
            });
            setVerified(true);
            setMessage("OTP verified successfully.");
        }
        catch(error:any){
            setMessage(error?.response?.data?.message || "Invalid OTP.");
        }
        finally{
            setLoading(false);
        }
    };

    // Upload audio tweet

    const uploadAudioTweet = async () => {
        try {
            setLoading(true);
            setMessage("");

            if (!verified) {
                setMessage("Please verify OTP first.");
                return;
            }

            const audioToUpload = recordedAudio ? new File([recordedAudio], "recorded_audio.wav", { type: "audio/wav" }) : audioFile;

            if (!audioToUpload) {
                setMessage("Please select an audio file.");
                return;
            }

            if (!checkUploadTime()) {
                setMessage("Audio tweets are allowed only between 2:00 PM and 7:00 PM IST");
                return;
            }

            const formData = new FormData();
            formData.append("audio", audioToUpload);

            const response = await axiosInstance.post("/audio-tweet", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("UPLOAD RESPONSE:", response.data);

            const audioUrl = response.data.audio || response.data.file;

            if (audioUrl) {
                localStorage.setItem("uploadedAudio", audioUrl);
                setUploadedAudio(audioUrl);
                window.dispatchEvent(
                    new CustomEvent("audioUploaded", { detail: audioUrl })
                );
            }

            setMessage("Audio tweet uploaded successfully.");
            console.log("Saved audio:", audioUrl);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error: any) {
            setMessage(error?.response?.data?.message || "Failed to upload audio tweet.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg space-y-4"> 
        <h2 className="text-xl font-semibold"> 
           🎤 {t("audioTweet") || "Audio Tweet"}
        </h2>

        <div className="mt-4 flex gap-3 items-center">

        {!isRecording ? (
        <button
           type="button"
           onClick={startRecording}
           className="bg-green-600 text-white px-5 py-3 rounded-lg"
        >
               🎙️ Record Voice
        </button>
        ) : (
         <button
             type="button"
             onClick={stopRecording}
             className="bg-red-600 text-white px-5 py-3 rounded-lg"
         >
            ⏹ Stop Recording
         </button>
        )}

       </div>

         {audioPreview && (
             <div className="mt-4">
             <p>Recorded Voice Preview:</p>
             <audio controls src={audioPreview} />
             </div>
       )}

        <input ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleSelectAudio}
       />

       {audioFile && (
        <p>
            Selected: <b>{audioFile.name}</b>
        </p>
       )}    

        {!otpSent && ( 
            <button type="button" 
            onClick={() => {
                console.log("Send OTP button clicked");
                sendOTP();
            }}
        
             className="px-4 py-2 bg-blue-500 text-white rounded" > 
             {t("sendOtp") || "Send OTP"}
             </button> 
            )}



        {otpSent && !verified && ( 
            <div className="space-y-2"> 
            <input 
            type="text" 
            placeholder="Enter OTP" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            className="border p-2 rounded" /> 
            
            <button 
            type="button" 
            onClick={verifyOTP} 
            disabled={loading} 
            className="px-4 py-2 bg-green-500 text-white rounded" > 
            {loading ? "Verifying..." : "Verify OTP"} 
            </button> 
            </div> 
        )}

        {verified && ( 
            <button 
            type="button" 
            onClick={uploadAudioTweet} 
            disabled={loading} 
            className="px-4 py-2 bg-black text-white rounded" > 
            
            {loading ? "Uploading..." : "Post Audio Tweet"} 
            </button> 
            )} 
            
            {message && ( 
                <p className="text-sm"> 
                {message} 
                </p> 
                
            )} 
            
            </div> 
        );
    }

        