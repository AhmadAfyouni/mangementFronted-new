import useLanguage from "@/hooks/useLanguage";

interface TaskStatusBadgeProps {
    count: string | number;
    label: string;
    color: string;
  }
  
  const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ count, label, color }) => {
    const {t} = useLanguage()
    return(
    <div className="flex flex-col items-center p-4 bg-secondary rounded-lg">
      <div className={`text-2xl font-bold ${color}`}>{count}</div>
      <div className="text-sm text-slate-400">{t(label)}</div>
    </div>
  )};
  
export default TaskStatusBadge  