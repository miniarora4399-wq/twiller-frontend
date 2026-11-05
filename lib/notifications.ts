import { Content } from "next/font/google";

export const UserTweetPost = (content:string) =>{
    const Tweetwords = ["cricket", "science"];
    return Tweetwords.some((keyword) =>
    content.toLowerCase().includes(keyword));

};

export const TweetNotification = (Content:string) =>{
    const NotificationsEnabled = localStorage.getItem("NotificationsEnabled") === "true";
    if(!NotificationsEnabled)                                                            
    {
        return;
    }
    if(Notification.permission!=="granted")
    {
        return;
    }
    if(!UserTweetPost(Content))
    {
        return;
    }
    new Notification("New Tweet",{
        body:Content,
    });
};