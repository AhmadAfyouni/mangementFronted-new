"use client";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { useEffect, useRef, useState } from "react";

// Notification icon component
export const NotificationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

// Interface for notification data
export interface NotificationType {
  _id: string;
  title: string;
  message: string;
  notificationPushDateTime: string;
  isRead: boolean;
  empId: string;
}

interface NotificationProps {
  isLightMode: boolean;
  onToggleOtherDropdowns?: () => void; // Optional callback to close other dropdowns
}

const Notification = ({
  isLightMode,
  onToggleOtherDropdowns,
}: NotificationProps) => {
  const { t } = useLanguage();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const notificationModalRef = useRef<HTMLDivElement>(null);
  const [clickedNotificationId, setClickedNotificationId] = useState<
    string | null
  >(null);

  const { data: notifications = [], isLoading } = useCustomQuery<
    NotificationType[]
  >({
    queryKey: ["notifications"],
    url: `/notifications/get-my-notifications`,
  });

  const { mutate: markAsReadMutation, isPending } = useCreateMutation({
    endpoint: clickedNotificationId
      ? `/notifications/mark-read/${clickedNotificationId}`
      : "",
    onSuccessMessage: "Notification Read successfully!",
    invalidateQueryKeys: ["notifications"],
    requestType: "get",
  });

  console.log("notifications : ", notifications);

  // Count unread notifications
  const unreadCount =
    notifications &&
    notifications.filter((n: NotificationType) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationModalRef.current &&
        !notificationModalRef.current.contains(event.target as Node)
      ) {
        setIsNotificationModalOpen(false);
      }
    };

    if (isNotificationModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationModalOpen]);

  // Function to handle notification bell click
  const handleNotificationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotificationModalOpen(!isNotificationModalOpen);

    if (!isNotificationModalOpen && onToggleOtherDropdowns) {
      // Close other dropdowns if opening notifications
      onToggleOtherDropdowns();
    }
  };

  // Function to mark a notification as read
  const markAsRead = (id: string) => {
    setClickedNotificationId(id);
    // Use setTimeout to ensure state is updated before the mutation is called
    setTimeout(() => {
      markAsReadMutation({});
    }, 0);
  };

  // Function to mark all notifications as read
  const markAllAsRead = () => {
    // Implement mark all as read functionality if needed
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="relative group">
      <div
        className="p-2 bg-blue-100 rounded-full cursor-pointer transform transition-all duration-200 
        hover:bg-blue-200 hover:shadow-lg active:scale-95"
        onClick={handleNotificationClick}
      >
        <NotificationIcon />

        {/* Notification counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-blue-100 group-hover:border-blue-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>

      {/* Notification Modal */}
      {isNotificationModalOpen && (
        <div
          ref={notificationModalRef}
          className={`
            absolute right-0 top-full mt-2
            w-80 md:w-96 bg-secondary 
            shadow-lg rounded-lg overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-200
            z-50
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 flex justify-between items-center border-b border-slate-600/30">
            <h3 className="text-twhite font-semibold">
              {t("Notifications")}
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                {t("Mark all as read")}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                {t("Loading notifications...")}
              </div>
            ) : notifications && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {t("No notifications")}
              </div>
            ) : (
              <ul className="text-twhite divide-y divide-slate-600/30">
                {notifications &&
                  notifications.map((notification: NotificationType) => (
                    <li
                      key={notification._id}
                      className={`
                      p-3 cursor-pointer transition-colors duration-200
                      ${!notification.isRead ? "bg-slate-700/20" : ""}
                      ${
                        isLightMode
                          ? "hover:bg-slate-700/20 hover:text-tblackAF"
                          : "hover:bg-tblack"
                      }
                      ${
                        clickedNotificationId === notification._id && isPending
                          ? "opacity-50"
                          : ""
                      }
                    `}
                      onClick={() => {
                        if (!notification.isRead && !isPending) {
                          markAsRead(notification._id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                            !notification.isRead
                              ? "bg-red-500"
                              : "bg-transparent"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-tmid mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-tbright mt-1">
                            {formatDate(notification.notificationPushDateTime)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
