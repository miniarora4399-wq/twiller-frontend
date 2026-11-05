"use client";

import React from "react";
import {useState} from "react";
import axiosInstance from "@/lib/axiosInstance";
import { resolve } from "path";
import { rejects } from "assert";
import { error } from "console";
import { Key } from "lucide-react";
import { handler } from "next/dist/build/templates/app-route";
import { useLanguage } from "@/context/LanguageContext";

declare global {
    interface Window {
       Razorpay : new (options: any) =>{
        open: () => void;
       };
    }
}

const plans = [
   {name:"Free", price:0, limit: "1 tweet"},
   {name:"Bronze", price:100, limit: "3 tweets"},
   {name:"Silver", price:300, limit: "5 tweets"},
   {name:"Gold", price:1000, limit: "Unlimited tweets"},
];
export default function SubscriptionPlans(){
    const [loading, setloading] = useState(false);
    const [message, setmessage] = useState("");
    const { t } = useLanguage();

    const subscribe = async (plan:string) =>
    {
        if(plan === "Free"){
            setmessage("Free Plan is available by default.");
            return;
        }

        setloading(true);
        setmessage("");

        try{
            // Check time and create Razorpay order on backend
            console.log("Selected plan:", plan);
            const orderRes = await axiosInstance.post(
                "/subscription/create-order",
                {plan}
            );
            
            const {orderId,amount,currency,keyId} = orderRes.data;

            // Load Razorpay checkout script
            if(!window.Razorpay){
                await new Promise<void>((resolve,rejects) => {
                    const script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = () => resolve();
                    script.onerror = () =>
                        rejects(new Error("Unable to load Razorpay."));
                        document.body.appendChild(script);
                });
            }

                 const checkout = new window.Razorpay({
                     key : keyId,
                amount,
                currency,
                name : "Twiller",
                description : `${plan} Subscription`,
                order_id: orderId,

                handler: async (response: {
                    razorpay_order_id : string;
                    razorpay_payment_id : string;
                    razorpay_signature : string;

                }) =>
                    {
                        try{
                            const verifyRes = await axiosInstance.post(
                                "/subscription/verify-payment",
                                response
                            );
                            setmessage(verifyRes.data.message);
                        } catch(error:any){
                            setmessage(error.response?.data?.message || "payment verification failed");
                        } finally {
                            setloading(false);
                        }
                    },
               modal: {
                  ondismiss: () => setloading(false),
               },
             });
             checkout.open();
        } catch(error:any){
            console.log(
              "Subscription error:", error.response?.data || error.message);
        
            setmessage(error.response?.data?.message || "Unable to start subscription");
            alert("Payments can only be made between 10 AM and 11 AM IST");
            setloading(false);
        }
    };

return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className="border rounded-xl p-5 shadow-sm"
        >
          <h2 className="text-xl font-bold">
            {plan.name} Plan
          </h2>

          <p className="text-2xl my-3">
            ₹{plan.price}
            <span className="text-sm"> / month</span>
          </p>

          <p className="mb-4">
            Tweet limit: {plan.limit}
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={() => subscribe(plan.name)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : plan.name === "Free"
                ? "Current Free Plan"
                : `Choose ${plan.name}`}
          </button>
        </div>
      ))}

      {message && (
        <p className="col-span-full mt-3">
          {message}
        </p>
      )}
    </div>
  );
}
