"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "@/i18n/routing";
import type { Notification } from "@/types";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, getNotificationIcon, formatNotificationTime } from "@/lib/queries/notifications";

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch notifications on mount
  useEffect(() => {
    if (!userId) return;
    
    const fetchNotifications = async () => {
      const [notifs, count] = await Promise.all([
        getNotifications(userId, 20),
        getUnreadCount(userId)
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
      setLoading(false);
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for streak-related events
  useEffect(() => {
    const handleStreakEvent = () => {
      // Refresh notifications when streak events occur
      if (userId) {
        getNotifications(userId, 20).then(setNotifications);
        getUnreadCount(userId).then(setUnreadCount);
      }
    };

    window.addEventListener("streak-updated", handleStreakEvent);
    window.addEventListener("streak-reset", handleStreakEvent);
    
    return () => {
      window.removeEventListener("streak-updated", handleStreakEvent);
      window.removeEventListener("streak-reset", handleStreakEvent);
    };
  }, [userId]);

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    const success = await markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead(userId);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'streak_reset':
      case 'bonus_unlocked':
      case 'streak_warning':
        router.push('/dashboard');
        break;
      case 'achievement':
        router.push('/conquistas');
        break;
      default:
        break;
    }
    
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-forest-green hover:bg-slate-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2"
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Bell Icon (GitHub style) */}
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-96 max-w-[90vw] bg-white rounded-2xl shadow-premium-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-forest-green hover:text-emerald-700 transition-colors"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-forest-green border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">Nenhuma notificação</p>
                <p className="text-xs text-slate-400 mt-1">Suas notificações aparecerão aqui</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${!notification.is_read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatNotificationTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    
                    {/* Unread Indicator */}
                    {!notification.is_read && (
                      <button
                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                        className="flex-shrink-0 w-2 h-2 rounded-full bg-forest-green hover:bg-emerald-600 transition-colors"
                        aria-label="Marcar como lida"
                        title="Marcar como lida"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs font-medium text-slate-600 hover:text-forest-green transition-colors py-1"
            >
              Ver todas as notificações
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
