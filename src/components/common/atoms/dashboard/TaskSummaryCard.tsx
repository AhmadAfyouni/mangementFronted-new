import useLanguage from "@/hooks/useLanguage";

// Enhanced TaskSummaryCard
const TaskSummaryCard: React.FC<{
    title: string;
    count: number;
    color: string;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
    trend?: { value: number; up: boolean };
}> = ({
    title,
    count,
    color,
    icon,
    bgColor,
    textColor,
    trend
}) => {
        const { t } = useLanguage();

        return (
            <div className={`${bgColor} rounded-xl max-h-[250px]  shadow-lg p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]`}>
                {/* Background decoration */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-125 transition-transform duration-500"></div>
                <div className="absolute right-8 top-8 w-12 h-12 rounded-full bg-white opacity-10 group-hover:scale-150 group-hover:opacity-20 transition-all duration-500"></div>

                {/* Icon with improved animation */}
                <div className={`${color} rounded-xl w-14 h-14 flex items-center justify-center shadow-md mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {icon}
                </div>

                {/* Content with improved typography */}
                <div className="relative z-10">
                    <div className="flex items-end gap-3 mb-2">
                        <div className={`text-5xl font-bold ${textColor} tracking-tight`}>{count}</div>
                        {trend && (
                            <div
                                className={`${trend.up ? 'text-green-100' : 'text-red-100'} font-medium flex items-center`}
                                title={`${trend.value}% compared to last month`}
                            >
                                <span className="text-xl mx-1">{trend.up ? '↑' : '↓'}</span> {trend.value}%
                            </div>
                        )}
                    </div>
                    <div className={`${textColor} font-semibold text-lg mb-1`}>{title}</div>
                    <div className={`text-sm opacity-80 ${textColor} font-medium`}>{t('task')}</div>
                </div>

                {/* Hover indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
        );
    };


export default TaskSummaryCard