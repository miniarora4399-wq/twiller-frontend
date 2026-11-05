"use client";

import React from 'react';

import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  MoreHorizontal,
  CreditCard,
  Settings,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import TwitterLogo from '../Twitterlogo';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface SidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function Sidebar({ currentPage = 'home', onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const {t} = useLanguage();

  const navigation = [
    { name: t('home'), icon: Home, current: currentPage === 'home', page: 'home' },
    { name: t('search'), icon: Search, current: currentPage === 'explore', page: 'explore' },
    { name: t('notifications'), icon: Bell, current: currentPage === 'notifications', page: 'notifications', badge: true },
    { name: t('messages'), icon: Mail, current: currentPage === 'messages', page: 'messages' },
    { name: t('bookmarks' as Parameters<typeof t>[0]), icon: Bookmark, current: currentPage === 'bookmarks', page: 'bookmarks' },
    { name: t('profile'), icon: User, current: currentPage === 'profile', page: 'profile' },
    { name: t('subscription'), icon: CreditCard, current: currentPage === 'subscription', page: 'subscription' },
    { name: t('more' as Parameters<typeof t>[0]), icon: MoreHorizontal, current: currentPage === 'more', page: 'more' },
  ];

  return (
    <div className="flex flex-col h-screen w-64 border-r border-gray-800 bg-black">
      <div className="p-4">
        <TwitterLogo size="lg" className="text-white" />
      </div>
      
      <nav className="flex-1 px-2">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-xl py-6 px-4 rounded-full hover:bg-gray-900 ${
                  item.current ? 'font-bold' : 'font-normal'
                } text-white hover:text-white`}
                onClick={() => {
                  if (item.page === "subscription"){
                    window.location.href = "/subscription";
                  }
                  else{
                  onNavigate?.(item.page)}
                }}
                
              >
                <item.icon className="mr-4 h-7 w-7" />
                {item.name}
                {item.badge && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                )}
              </Button>
            </li>
          ))}
        </ul>
        
        <div className="mt-8 px-2">
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full text-lg">
            {t("post") || "Post"}
          </Button>
        </div>
      </nav>
      
      {user && (
        <div className="p-4 border-t border-gray-800">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full justify-start p-3 rounded-full hover:bg-gray-900">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={user?.avatar || ""} alt={user?.displayName || "User"} />
                  <AvatarFallback>{user?.displayName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="text-white font-semibold">{user?.displayName || "User"}</div>
                  <div className="text-gray-400 text-sm">@{user.username}</div>
                </div>
                <MoreHorizontal className="h-5 w-5 text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black border-gray-800">
              <DropdownMenuItem className="text-white hover:bg-gray-900">
                <Settings className="mr-2 h-4 w-4" />
                {t("settings") || "Settings"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem 
                className="text-white hover:bg-gray-900"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("logout")} @{user.username}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}