"use client";

import 
{
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { auth } from "./firebase";
import axiosInstance from "../lib/axiosInstance";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  email: string;
  website: string;
  location: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => Promise<void>;
  updateProfile: (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  googleSignIn: () => void;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("twitter-user");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<FirebaseUser | null>(null);
  const [showLoginOTP, setShowLoginOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const otpPendingRef = useRef(false);
  const router = useRouter();
  
  const isChromeBrowser = () => {
    return (
      typeof window !== "undefined" &&
      /Chrome/.test(navigator.userAgent) &&
      /Google Inc/.test(navigator.vendor) && 
      !/OPR|Edge/.test(navigator.userAgent)
    );
  };


  useEffect(() => {
    // Check for existing session
    const unsubcribe = onAuthStateChanged(auth, async (firebaseUser) => {
      
      console.log("AUTH STATE CHANGED:", firebaseUser?.email);
      console.log("AUTH LISTENER RUNNING");
      console.log("OTP PENDING VALUE:", otpPendingRef.current);

      if (otpPendingRef.current) {
         console.log("OTP pending - skipping Twiller login");
         return;
        }

        console.log("AUTH LISTENER - SETTING USER");

      if (firebaseUser?.email) {
        try {
             const res = await axiosInstance.get("/loggedinuser", {
             params: { email: firebaseUser.email },
          });

          // if (res.data) {
          //   setUser(res.data);
          //   localStorage.setItem("twitter-user", JSON.stringify(res.data));
          // }
        } catch (err) {
          console.log("Failed to fetch user:", err);
        }
      } else {
        setUser(null);
        localStorage.removeItem("twitter-user");
      }
      setIsLoading(false);
    });
    return () => unsubcribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Mock authentication - in real app, this would call an API
    const usercred = await signInWithEmailAndPassword(auth, email, password);
    const firebaseuser = usercred.user;
    const res = await axiosInstance.get("/loggedinuser", {
      params: { email: firebaseuser.email },
    });
    if (res.data) {
      setUser(res.data);
      localStorage.setItem("twitter-user", JSON.stringify(res.data));
    }
    // const mockUser: User = {
    //   id: '1',
    //   username: 'johndoe',
    //   displayName: 'John Doe',
    //   avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    //   bio: 'Software developer passionate about building great products',
    //   joinedDate: 'April 2024'
    // };
    setIsLoading(false);
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => {
    setIsLoading(true);
    // Mock authentication - in real app, this would call an API
   
    const usercred = await createUserWithEmailAndPassword(auth, email, password);
    
    const user = usercred.user;
    const newuser: any = {
      username,
      displayName,
      avatar: user.photoURL || "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400",
      email: user.email,
    };
    const res = await axiosInstance.post("/register", newuser);
    if (res.data) {
      setUser(res.data);
      localStorage.setItem("twitter-user", JSON.stringify(res.data));
    }
    // const mockUser: User = {
    //   id: '1',
    //   username,
    //   displayName,
    //   avatar: 'https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400',
    //   bio: '',
    //   joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    // };
    setIsLoading(false);
  };

  const logout = async () => {
    setUser(null);
    await signOut(auth);
    localStorage.removeItem("twitter-user");
  };

  const updateProfile = async (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => {
    if (!user) return;

    setIsLoading(true);
    // Mock API call - in real app, this would call an API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedUser: User = {
      ...user,
      ...profileData,
    };
    const res = await axiosInstance.patch(
      `/userupdate/${user.email}`,
      updatedUser
    );
    if (res.data) {
      setUser(updatedUser);
      localStorage.setItem("twitter-user", JSON.stringify(updatedUser));
    }

    setIsLoading(false);
  };
  const googleSignIn = async () => {
    setIsLoading(true);
    

    try {
      const googleauthprovider = new GoogleAuthProvider();
      
      if(isChromeBrowser()){
           otpPendingRef.current = true;
           console.log("OTP PENDING SET TO TRUE");
        }


      const result = await signInWithPopup(auth, googleauthprovider);
      const firebaseuser = result.user;

      console.log("Google user:", firebaseuser);
      console.log("Google email:", firebaseuser.email);
      console.log("Google name:", firebaseuser.displayName);
      console.log("Google Sign-In response:", result);
      
      console.log("STEP 1: Google login completed");

      const token = await result.user.getIdToken();

      console.log("STEP 2: Firebase token received");

      if (!firebaseuser?.email) {
        throw new Error("No email found in Google account");
      }

      console.log("BROWSER:", navigator.userAgent);
      console.log("IS CHROME:", isChromeBrowser());
      console.log("BEFORE OTP SEND");
      console.log("OTP SENT - STOPPING LOGIN");

      if (isChromeBrowser()) {
        otpPendingRef.current = true;
           console.log("BEFORE OTP SEND - NOT CHROME");
        const otpResponse = await axiosInstance.post("/send-login-history-otp", {
          email: firebaseuser.email,
        });

        console.log("OTP API RESPONSE:", otpResponse.data);
        console.log("OTP SENT TO EMAIL:");

        setPendingGoogleUser(result.user);
        setShowLoginOTP(true);
        setOtpMessage("OTP sent to your registered email.");
        sessionStorage.setItem("pendingGoogleEmail", result.user.email || "");

        console.log("OTP SENT SUCCESSFULLY");
        console.log("STOPPING GOOGLE LOGIN");
        console.log("OTP SENT - NAVIGATING TO OTP PAGE");
        console.log("SAVED EMAIL:", sessionStorage.getItem("pendingGoogleEmail"));

        
        router.push("/login");
        console.log("RETURNING BEFORE NORMAL LOGIN");
        return; 
      }

      let userData;
     
      try {
        const res = await axiosInstance.get("/loggedinuser", {
          params: { email: firebaseuser.email },
        });

        console.log("Backend status:", res.status);
        console.log("Backend data:", res.data);
        console.log("Backend data type:", typeof res.data);
        userData = res.data;

        console.log("LOGIN HISTORY API CALL STARTED");
        console.log("LOGIN USER:",userData);
        console.log("USER ID:",userData._id);
        
        try{
            const historyRes = await axiosInstance.post("/save-login-history",{
            userId: userData._id,
        });

        console.log("LOGIN HISTORY SAVED SUCCESSFULLY:", historyRes.data);
      }catch(error){
        console.error("LOGIN HISTORY SAVE ERROR:",error);
      }
      setUser(userData);

        if(!userData || !userData._id){
          console.log("User not found in backend");
        }

      } catch (err: any) {
        const newuser: any = {
          username: firebaseuser.email.split("@")[0],
          displayName: firebaseuser.displayName || "User",
          avatar: firebaseuser.photoURL || "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400",
          email: firebaseuser.email,
        };

        const registerRes = await axiosInstance.post("/register", newuser);
        userData = registerRes.data;
      }

      if (userData) {
        setUser(userData);
        localStorage.setItem("twitter-user", JSON.stringify(userData));
        router.push("/");
      } else {
        throw new Error("Login/Register failed: No user data returned");
      }
    }
    catch (error: any) {
      console.error("Google Sign-In Error:", error);
      alert(error.response?.data?.message || error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
    

  };
  
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 

    console.log("FIREBASE USER:", auth.currentUser);
    console.log("PENDING EMAIL:", sessionStorage.getItem("pendingGoogleEmail"));
    console.log("PENDING GOOGLE USER:", pendingGoogleUser);
    
    const email = pendingGoogleUser?.email || 
                  auth.currentUser?.email ||
                  sessionStorage.getItem("pendingGoogleEmail");
    
    console.log("FINAL EMAIL:", email);

    if (!email) {
      console.log("EMAIL NOT FOUND - STOPPING");
      setOtpMessage("Google login session expired. Please log in again.");
      return;
    }

    console.log("SENDING VERIFY API REQUEST");

    try {
      const response = await axiosInstance.post("/verify-login-history-otp", {
        email,
        otp,
      }); 

      console.log("OTP VERIFY API RESPONSE:", response.data);

      if (response.data.success) {

         console.log("1. OTP VERIFIED");
         console.log("2. CALLING USER API");

        setOtpMessage("OTP verified successfully. Logging in...");
 
        const userResponse = await axiosInstance.get("/loggedinuser", {
          params: { email },
        });

         console.log("2. USER API RESPONSE:", userResponse.data);
         console.log("3. USER API STATUS:", userResponse.status);
         console.log("4. USER API DATA:", userResponse.data);
        
         const userData = userResponse.data;

        if (!userData || !userData._id) {
          throw new Error("Unable to load user information");
        }
        
        console.log("3. USER DATA FOUND");

        setUser(userData);

        console.log("4. SET USER COMPLETED");

        localStorage.setItem("twitter-user", JSON.stringify(userData));
        setShowLoginOTP(false);
        setPendingGoogleUser(null);
        setOtp("");
        sessionStorage.removeItem("pendingGoogleEmail");

        console.log("5. NAVIGATING TO HOME");

        router.push("/");
      }else {
        setOtpMessage(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      console.log("CATCH BLOCK REACHED");
      console.log("STATUS:", error.response?.status);
      console.log("BACKEND ERROR:", error.response?.data);
      console.log("REQUEST DATA:", error.config?.data);
      console.error("OTP Verification Error:", error);
      setOtpMessage(error.response?.data?.message || "OTP verification failed. Please try again.");
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        signup,
        updateProfile,
        logout,
        isLoading,
        googleSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
