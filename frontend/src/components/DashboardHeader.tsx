import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  AlertTriangle,
  CreditCard,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { NotificationItem } from '../types';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle
}) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');

      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'expiry':
        return (
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        );

      case 'payment':
        return (
          <CreditCard className="w-4 h-4 text-rose-500" />
        );

      case 'maintenance':
        return (
          <Wrench className="w-4 h-4 text-sky-500" />
        );

      default:
        return (
          <ShieldAlert className="w-4 h-4 text-emerald-500" />
        );
    }
  };

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">

      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">

        {/* Notifications Bell Popover */}
        <div className="relative">

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="System Notifications"
          >
            <Bell className="w-5 h-5" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">

              {/* Notifications Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">

                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Notifications
                </span>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                )}

              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">

                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No notifications available.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 flex items-start gap-3 transition-colors ${
                        n.is_read
                          ? 'opacity-70 bg-transparent'
                          : 'bg-rose-50/50 dark:bg-rose-950/20'
                      }`}
                    >

                      {/* Notification Icon */}
                      <div className="mt-1">
                        {getIcon(n.type)}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1">

                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {n.title}
                        </p>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          {n.message}
                        </p>

                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.created_at).toLocaleString()}
                        </span>

                      </div>

                      {/* Mark As Read */}
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-500"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                    </div>
                  ))
                )}

              </div>
            </div>
          )}

        </div>

        {/* User Role Badge */}
        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">

          <div className="w-9 h-9 rounded-full bg-rose-600 text-white font-bold text-sm flex items-center justify-center uppercase shadow-md">
            {user?.name?.charAt(0)}
          </div>

          <div>

            <span className="block text-xs font-bold text-slate-900 dark:text-white">
              {user?.name}
            </span>

            <span className="block text-[10px] font-semibold text-rose-600 dark:text-rose-400 tracking-wider uppercase">
              {user?.role}
            </span>

          </div>

        </div>

      </div>
    </header>
  );
};