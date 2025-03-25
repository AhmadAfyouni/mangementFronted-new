import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Direction,
} from "@mui/material";
import { Edit, Eye, Lock, LucideIcon, ShieldCheck, Trash } from "lucide-react";
import React from "react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string[];
  language: "en" | "ar";
  actionText: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}


// Helper function to get icon and color based on permission type
export const getPermissionInfo = (permission: string): { icon: LucideIcon; color: string } => {
  if (permission.toLowerCase().includes("view"))
    return { icon: Eye, color: "text-blue-400" };
  if (permission.toLowerCase().includes("edit") || permission.toLowerCase().includes("update"))
    return { icon: Edit, color: "text-amber-400" };
  if (permission.toLowerCase().includes("delete"))
    return { icon: Trash, color: "text-red-400" };
  if (permission.toLowerCase().includes("admin"))
    return { icon: ShieldCheck, color: "text-green-400" };
  return { icon: Lock, color: "text-purple-400" };
};

// Permission Card Component
const PermissionCard = ({ permission, isLightMode }: { permission: string; isLightMode: boolean }) => {
  const { icon: Icon, color } = getPermissionInfo(permission);
  
  // Format the permission text
  const formatPermissionText = (text: string) => {
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  return (
    <div className={`
      relative overflow-hidden
      rounded-xl transition-all duration-200
      border h-[150px] p-4
      ${isLightMode 
        ? 'bg-darker/5 border-darker/10 hover:bg-darker/10' 
        : 'bg-dark/20 border-dark/40 hover:bg-dark/30'}
      group flex items-center
    `}>
      {/* Background decoration */}
      <div className={`
        absolute -right-8 -top-8 w-16 h-16 rounded-full
        transition-all duration-300 group-hover:scale-150
        opacity-10 group-hover:opacity-20
        ${isLightMode ? 'bg-darker' : 'bg-dark'}
      `} />

      <div className="flex flex-col justify-center items-center gap-4 relative z-10 w-full">
        {/* Icon container */}
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          transition-all duration-200 flex-shrink-0
          ${isLightMode 
            ? 'bg-white shadow-sm' 
            : 'bg-dark shadow-lg shadow-dark/20'}
        `}>
          <Icon 
            size={22} 
            className={`${color} transition-transform duration-200 group-hover:scale-110`}
          />
        </div>

        {/* Permission text */}
        <div className="flex-1 min-w-0 px-2 w-full">
          <p className={`
            text-sm font-medium text-center break-words
            ${isLightMode ? 'text-tblack' : 'text-twhite'}
            transition-colors duration-200
            max-w-full mx-auto
          `}>
            {formatPermissionText(permission)}
          </p>
        </div>
      </div>
    </div>
  );
};
const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  language,
  actionText,
  maxWidth = "sm",
  fullWidth = true,
}) => {
  const { isLightMode } = useCustomTheme();
  const { t, getDir } = useLanguage();
  const textAlignment = language === "en" ? "text-left" : "text-right";

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        className: `rounded-xl overflow-hidden shadow-xl transform transition-all duration-200`,
        style: {
          direction: getDir() as Direction,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        className={`
          ${textAlignment} p-6
          ${isLightMode ? "text-tblackAF bg-main" : "text-twhite bg-secondary"}
          flex items-center justify-between 
          ${isLightMode ? "border-darker/10" : "border-dark/40"}
        `}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-twhite" size={20} />
          <h2 className="text-xl font-medium text-twhite">{title}</h2>
        </div>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        className={`
          p-6
          ${isLightMode ? "bg-main" : "bg-secondary"}
          ${isLightMode ? "text-tblack" : "text-tmid"}
        `}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.map((item, index) => (
            <PermissionCard 
              key={index}
              permission={t(item)}
              isLightMode={isLightMode}
            />
          ))}
        </div>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        className={`
          p-4 
          ${isLightMode 
            ? "bg-main border-darker/10" 
            : "bg-secondary border-dark/40"}
          ${getDir() == "rtl" ? "justify-start" : "justify-end"}
        `}
      >
        <button
          onClick={onClose}
          className={`
            py-2 px-6 rounded-lg font-medium
            transition-all duration-200 
            ${isLightMode 
              ? "bg-darker text-twhite hover:bg-opacity-90" 
              : "bg-dark text-twhite hover:bg-opacity-80"}
            hover:shadow-lg hover:-translate-y-0.5
            active:translate-y-0 active:shadow-md
          `}
        >
          {actionText}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomModal;