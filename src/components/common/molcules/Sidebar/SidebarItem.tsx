import useCustomTheme from "@/hooks/useCustomTheme";
import Image from "next/image";

type SidebarItemProps = {
  icon: string;
  label: string;
  isExpanded: boolean;
  isSelected: boolean;
  onClick: () => void;
};

export const SidebarItem = ({
  icon,
  label,
  isExpanded,
  isSelected,
  onClick,
}: SidebarItemProps) => {
  const { isLightMode } = useCustomTheme();
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center ${
        isLightMode ? "text-tblackAF" : "text-twhite"
      } ${isExpanded ? "justify-start" : "justify-center"} relative p-2`}
    >
      {isSelected && (
        <div
          className={`absolute inset-0 ${
            isLightMode ? "bg-darker" : "bg-secondary"
          } rounded-md`}
          style={{ padding: "6px" }}
        />
      )}
      <div className="relative z-10 flex items-center">
        <Image src={icon} alt="icon" width={20} height={20} />
        {isExpanded && <p className="ml-2">{label}</p>}
      </div>
    </div>
  );
};
