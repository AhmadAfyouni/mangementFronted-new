"use client";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMokkBar } from "@/components/Providers/Mokkbar";

// Clean notification icon component
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
  titleAr?: string; // Added for Arabic title
  messageAr?: string; // Added for Arabic message
}

interface NotificationProps {
  isLightMode: boolean;
  onToggleOtherDropdowns?: () => void;
}

const Notification = ({
  isLightMode,
  onToggleOtherDropdowns,
}: NotificationProps) => {
  const { t, currentLanguage } = useLanguage();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const notificationModalRef = useRef<HTMLDivElement>(null);
  const [clickedNotificationId, setClickedNotificationId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { setSnackbarConfig } = useMokkBar();

  const { data: notifications = [], isLoading } = useCustomQuery<NotificationType[]>({
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

  const { mutate: markAllAsReadMutation, isPending: isMarkingAllAsRead } = useCreateMutation({
    endpoint: `/notifications/mark-all-read`,
    onSuccessMessage: "All notifications marked as read!",
    invalidateQueryKeys: ["notifications"],
    requestType: "get",
  });

  // Count unread notifications
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n: NotificationType) => !n.isRead).length
    : 0;

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

  const handleNotificationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotificationModalOpen(!isNotificationModalOpen);

    if (!isNotificationModalOpen && onToggleOtherDropdowns) {
      onToggleOtherDropdowns();
    }
  };

  const markAsRead = (id: string) => {
    setClickedNotificationId(id);
    setTimeout(() => {
      markAsReadMutation({});
    }, 0);
  };

  const markAllAsRead = () => {
    if (unreadCount === 0 || isMarkingAllAsRead) return;
    markAllAsReadMutation({}, {
      onSuccess: () => {
        // Invalidate notifications query for seamless UX
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        setSnackbarConfig({
          open: true,
          message: t("All notifications marked as read!"),
          severity: "success",
        });
      }
    });
  };

  // Helper to get the correct localized field
  const getLocalized = (notification: NotificationType, field: string) => {
    if (currentLanguage === "ar") {
      return (
        notification[(field + "Ar") as keyof NotificationType] ||
        notification[(field + "_ar") as keyof NotificationType] ||
        notification[field as keyof NotificationType]
      );
    }
    return notification[field as keyof NotificationType];
  };

  // Clean date formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="relative group">
      <div
        className="p-2 bg-blue-100 rounded-full cursor-pointer transition-all duration-200 
        hover:bg-blue-200 hover:shadow-md active:scale-95"
        onClick={handleNotificationClick}
      >
        <NotificationIcon />

        {/* Clean notification counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-blue-100 group-hover:border-blue-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>

      {/* Clean notification modal */}
      {isNotificationModalOpen && (
        <div
          ref={notificationModalRef}
          className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-secondary shadow-xl rounded-lg overflow-hidden z-50"
          onClick={(e) => e.stopPropagation()}
          dir={currentLanguage === "ar" ? "rtl" : "ltr"}
        >
          {/* Clean header */}
          <div className="p-4 flex justify-between items-center border-b border-slate-600/30">
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
                disabled={isMarkingAllAsRead}
                className={`text-xs transition-colors duration-200 px-2 py-1 rounded ${isMarkingAllAsRead
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  }`}
              >
                {isMarkingAllAsRead ? t("Marking...") : t("Mark all as read")}
              </button>
            )}
          </div>

          {/* Clean content area */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                {t("Loading notifications...")}
              </div>
            ) : !Array.isArray(notifications) || notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <div className="mb-2 opacity-50">
                  <NotificationIcon />
                </div>
                {t("No notifications")}
              </div>
            ) : (
              <ul className="text-twhite">
                {notifications.map((notification: NotificationType) => (
                  <li
                    key={notification._id}
                    className={`
                      p-4 transition-colors duration-200 border-b border-slate-600/20 last:border-b-0
                      ${!notification.isRead ? "bg-slate-700/20" : ""}
                      ${isLightMode
                        ? "hover:bg-slate-100"
                        : "hover:bg-slate-700/30"
                      }
                      ${clickedNotificationId === notification._id && isPending ? "opacity-50" : ""}
                    `}
                    onClick={() => {
                      if (!notification.isRead && !isPending) {
                        markAsRead(notification._id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Clean unread indicator */}
                      <div
                        className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.isRead ? "bg-red-500" : "bg-transparent"
                          }`}
                      ></div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">
                          {getLocalized(notification, "title")}
                        </h4>
                        <p className="text-sm text-tmid mb-2 line-clamp-2">
                          {getLocalized(notification, "message")}
                        </p>
                        <p className="text-xs text-tbright">
                          {formatDate(notification.notificationPushDateTime)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Clean footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-600/20 text-center">
              <p className="text-xs text-tbright">
                {notifications.length} {t("notification(s) total")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;