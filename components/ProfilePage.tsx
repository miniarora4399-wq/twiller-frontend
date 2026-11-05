"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link as LinkIcon,
  MoreHorizontal,
  Camera,
  Settings,
  FireExtinguisher,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import TweetCard from "./TweetCard";
import { Card, CardContent } from "./ui/card";
import Editprofile from "./Editprofile";
import axiosInstance from "@/lib/axiosInstance";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { on } from "events";
import ProfileLoginHistory from "./ProfileLoginHistory";
import {User,Clock} from "lucide-react"



interface Tweet {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  comments: number;
  liked?: boolean;
  retweeted?: boolean;
  image?: string;
}
const tweets: Tweet[] = [
  {
    id: "1",
    author: {
      id: "1",
      username: "elonmusk",
      displayName: "Elon Musk",
      avatar:
        "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: true,
    },
    content:
      "Just had an amazing conversation about the future of AI. The possibilities are endless!",
    timestamp: "2h",
    likes: 1247,
    retweets: 324,
    comments: 89,
    liked: false,
    retweeted: false,
  },
  {
    id: "2",
    author: {
      id: "1",
      username: "sarahtech",
      displayName: "Sarah Johnson",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: false,
    },
    content:
      "Working on some exciting new features for our app. Can't wait to share what we've been building! 🚀",
    timestamp: "4h",
    likes: 89,
    retweets: 23,
    comments: 12,
    liked: true,
    retweeted: false,
  },
  {
    id: "3",
    author: {
      id: "4",
      username: "designguru",
      displayName: "Alex Chen",
      avatar:
        "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: true,
    },
    content:
      "The new design system is finally complete! It took 6 months but the results are incredible. Clean, consistent, and accessible.",
    timestamp: "6h",
    likes: 456,
    retweets: 78,
    comments: 34,
    liked: false,
    retweeted: true,
    image:
      "https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];
export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const { t } = useLanguage();

  const loggedInUserId = String(
  (user as any)?._id || (user as any)?.id || ""
);

  console.log("LOGIN USER:", user);
  console.log("USER ID:", user?._id);
  

  if (!user) return null;
  const [tweets, setTweets] = useState<any>([]);
  const [loading, setloading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const fetchTweets = async () => {
    try {
      setloading(true);
      const res = await axiosInstance.get("/post");
      setTweets(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setloading(false);
    }
  };
  useEffect(() => {
    fetchTweets();
  }, []);

  // Filter tweets by current user
  const userTweets = tweets.filter((tweet: any) => tweet.author._id === user._id);
  const [NotificationsEnabled, setNotificationEnabled] = useState(false)

  useEffect(()=>
  {
    const NotificationPreference =localStorage.getItem("NotificationsEnabled");
    console.log("Notification Preference",NotificationPreference);
    setNotificationEnabled(NotificationPreference === "true");
  },[]);



  const handleNotificationToggle = async () =>{
   
    if(NotificationsEnabled)
    {
      setNotificationEnabled(false);
      localStorage.setItem("NotificationsEnabled", "false");
      console.log("Notification OFF",localStorage.getItem("NotificationsEnabled"));
    }
    else
    {
      const permission = await Notification.requestPermission();
      
      if(permission === "granted")
      {
        setNotificationEnabled(true);
        localStorage.setItem("NotificationsEnabled", "true");
        console.log("Notification ON",localStorage.getItem("NotificationsEnabled"));
      }
    }
 };

 const handleImageChange =(e:React.ChangeEvent<HTMLInputElement>) =>{
  const file = e.target.files?.[0];

  if(file){
    setAvatar(URL.createObjectURL(file));
  }
 };


return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10">
        <div className="flex items-center px-4 py-3 space-x-8">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-full hover:bg-gray-900"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">{user.displayName}</h1>
            <p className="text-sm text-gray-400">{userTweets.length} {t("posts") || "posts"}</p>
          </div>
        </div>
      </div>

      {/* Cover Photo */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70"
          >
            <Camera className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-black">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback className="text-2xl">
                {user.displayName}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-2 right-2 p-2 rounded-full bg-black/70 hover:bg-black/90"
            >
              <Camera className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
        

        {/* Edit Profile Button */}
        <div className="flex justify-end p-4">
          <Button
            variant="outline"
            className="border-gray-600 text-white bg-gray-950 font-semibold rounded-full px-6"
            onClick={() => setShowEditModal(true)}
          >
            {t("editProfile") ||"Edit profile"}
          </Button>
          
          <Button
            variant="outline"
            className="border-gray-600 text-white bg-gray-950 font-semibold rounded-full px-6"
            onClick={() => setShowLoginHistory(!showLoginHistory)}
          >
          <Clock className="w-4 h-4 mr-2" />
             {t("loginHistory") || "Login History"}
          </Button>
        </div>
            {showLoginHistory && (
                 <div className="mt-4">
                    <ProfileLoginHistory userId={String(user?._id || "")}/>
                 </div>
            )}
        </div>

      {/* Profile Info */}
      <div className="px-4 pb-4 mt-12">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-white mt-4">
              {user.displayName}
            </h1>
            <p className="text-gray-400">@{user.username}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-full hover:bg-gray-900"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-400" />
          </Button>
        </div>

        {user.bio && (
          <p className="text-white mb-3 leading-relaxed">{user.bio}</p>
        )}

        <div className="flex items-center space-x-4 text-gray-400 text-sm mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{t("earth") || (user.location ? user.location : "Earth")}</span>
          </div>
          <div className="flex items-center space-x-1">
            <LinkIcon className="h-4 w-4" />
            <span className="text-blue-400">
              {t("exampleWebsite") || (user.website ? user.website : "example.com")}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>
              {t("joined") || "Joined "}
              {user.joinedDate &&
                new Date(user.joinedDate).toLocaleDateString("en-us", {
                  month: "long",
                  year: "numeric",
                })}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-4 border rounded-lg">

    {/*Multi Language */}
      <div className="mt-2">
      <div className="w-40 text-sm">
          <LanguageSwitcher />
      </div>
      </div>
    
    { /* Notifications */ }  
     <div>
        <h3 className="font-semibold">{t("notifications")|| "Notifications"}</h3>
        <p className="text-sm text-gray-500">
              {t("tweetNotifications")|| "Get notifications for cricket and science tweets"}
        </p>
     </div>

     <button
        onClick={handleNotificationToggle}
        className="px-4 py-2 rounded-lg bg-blue-500 text-white"
    >
      {NotificationsEnabled ? t("on")|| "ON" : t("off")||"OFF"}
     </button>
     </div>

     
     

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
        <TabsList className="grid w-full grid-cols-5 bg-transparent border-b border-gray-800 rounded-none h-auto">
          <TabsTrigger
            value="posts"
            className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 py-4 font-semibold"
          >
            {t("posts") || "Posts"}
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 py-4 font-semibold"
          >
            {t("replies") || "Replies"}
          </TabsTrigger>
          <TabsTrigger
            value="highlights"
            className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 py-4 font-semibold"
          >
            {t("highlights") || "Highlights" }
          </TabsTrigger>
          <TabsTrigger
            value="articles"
            className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 py-4 font-semibold"
          >
           {t("articles") || "Articles"}
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 py-4 font-semibold"
          >
            {t("media") || "Media" }
          </TabsTrigger>
          
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          <div className="divide-y divide-gray-800">
            { loading ? (
              <Card className="bg-black border-none">
                <CardContent className="py-12 text-center">
                  <div className="text-gray-400">
                    <h3 className="text-2xl font-bold mb-2">
                     {t("noPostsYet") || "You haven't posted yet"}
                    </h3>
                    <p>{t("noPostsDescription")
                     || "When you post, it will show up here"}.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              userTweets.map((tweet:any) => (
                <TweetCard key={tweet._id} tweet={tweet} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="replies" className="mt-0">
          <Card className="bg-black border-none">
            <CardContent className="py-12 text-center">
              <div className="text-gray-400">
                <h3 className="text-2xl font-bold mb-2">
                  {t("noRepliesYet") || "You haven't replied yet" }
                </h3>
                <p>{t("noRepliesDescription") 
                  || "When you reply to a post, it will show up here."}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="highlights" className="mt-0">
          <Card className="bg-black border-none">
            <CardContent className="py-12 text-center">
              <div className="text-gray-400">
                <h3 className="text-2xl font-bold mb-2">
                 {t("mediaPrompt") || "Lights, camera … attachments!"}
                </h3>
                <p>{t("mediaDescription") ||
                 "When you post photos or videos, they will show up here."}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="mt-0">
          <Card className="bg-black border-none">
            <CardContent className="py-12 text-center">
              <div className="text-gray-400">
                <h3 className="text-2xl font-bold mb-2">
                  {t("noArticlesYet") || "You haven't written any articles"}
                </h3>
                <p>{t("noArticlesDescription") || 
                "When you write articles, they will show up here."}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-0">
          <Card className="bg-black border-none">
            <CardContent className="py-12 text-center">
              <div className="text-gray-400">
                <h3 className="text-2xl font-bold mb-2">
                  {t("mediaPrompt") || "Lights, camera … attachments!" }
                </h3>
                <p>{t("mediaDescription") || 
                "When you post photos or videos, they will show up here."}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        
      </Tabs>

      <Editprofile
        isopen={showEditModal}
        onclose={() => setShowEditModal(false)}
      />
    </div>
  );
}