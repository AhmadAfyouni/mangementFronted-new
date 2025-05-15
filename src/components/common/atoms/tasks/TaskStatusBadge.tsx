import useLanguage from "@/hooks/useLanguage";

interface TaskStatusBadgeProps {
  count: string | number;
  label: string;
  color: string;
}

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ count, label, color }) => {
  const {t, currentLanguage} = useLanguage();
  const isRTL = currentLanguage === "ar";
  
  return(
    <div 
      className={`flex flex-col items-center p-6 bg-secondary rounded-xl border border-gray-700 shadow-lg hover:shadow-xl hover:border-gray-600 transition-all duration-300 transform hover:scale-105 ${isRTL ? 'text-right' : 'text-left'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className={`text-4xl font-bold ${color} mb-2`}>{count}</div>
      <div className="text-sm text-gray-400 font-medium whitespace-nowrap">{t(label)}</div>
    </div>
  )
};

export default TaskStatusBadge
