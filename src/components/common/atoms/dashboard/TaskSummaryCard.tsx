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
            <div className={`${bgColor} rounded-xl max-h-[250px] shadow-lg p-4 sm:p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] sm:hover:translate-y-[-4px]`}>
                {/* Background decoration */}
                <div className="absolute -right-4 sm:-right-6 -bottom-4 sm:-bottom-6 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white opacity-10 group-hover:scale-125 transition-transform duration-500"></div>
                <div className="absolute right-6 sm:right-8 top-6 sm:top-8 w-8 sm:w-12 h-8 sm:h-12 rounded-full bg-white opacity-10 group-hover:scale-150 group-hover:opacity-20 transition-all duration-500"></div>

                {/* Icon with improved animation */}
                <div className={`${color} rounded-lg sm:rounded-xl w-10 sm:w-14 h-10 sm:h-14 flex items-center justify-center shadow-md mb-3 sm:mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <div className="scale-75 sm:scale-100">
                        {icon}
                    </div>
                </div>

                {/* Content with improved typography */}
                <div className="relative z-10">
                    <div className="flex items-end gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <div className={`text-3xl sm:text-5xl font-bold ${textColor} tracking-tight`}>{count}</div>
                        {trend && (
                            <div
                                className={`${trend.up ? 'text-green-100' : 'text-red-100'} font-medium flex items-center text-sm sm:text-base`}
                                title={`${trend.value}% compared to last month`}
                            >
                                <span className="text-lg sm:text-xl mx-1">{trend.up ? '↑' : '↓'}</span> {trend.value}%
                            </div>
                        )}
                    </div>
                    <div className={`${textColor} font-semibold text-sm sm:text-lg mb-1`}>{title}</div>
                    <div className={`text-xs sm:text-sm opacity-80 ${textColor} font-medium`}>{t('task')}</div>
                </div>

                {/* Hover indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
        );
    };


export default TaskSummaryCard