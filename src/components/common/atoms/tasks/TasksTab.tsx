import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

type Tab = {
  id: string;
  label: string;
  icon: string;
};

type TasksTabProps = {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
};

const TasksTab: React.FC<TasksTabProps> = ({
  tabs,
  activeTab,
  setActiveTab,
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();

  return (
    <div className={`flex gap-4 border-b text-twhite border-tmid mb-5`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`pb-2 flex items-center gap-2 ${
            activeTab === tab.id ? "border-b-2 border-tmid font-semibold" : ""
          }`}
        >
          <Image
            src={tab.icon}
            width={20}
            height={20}
            alt={`${tab.label} icon`}
            className={isLightMode ? `bg-tmid p-1 rounded-md` : ""}
          />
          <span>{t(tab.label)}</span>
        </button>
      ))}
    </div>
  );
};

export default TasksTab;
