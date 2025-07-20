import useLanguage from "@/hooks/useLanguage";
import { DailyTimelineResponse, TimeTracking } from "@/types/dashboard.type";
import { Clock } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Props interface for TimeTracker
interface TimeTrackerProps {
    dailyTimeline?: DailyTimelineResponse;
    timeTracking?: TimeTracking;
    isLoading?: boolean;
}

// Time Tracker Components
const TimeTracker: React.FC<TimeTrackerProps> = ({
    dailyTimeline,
    timeTracking,
    isLoading = false
}) => {
    const { t } = useLanguage();

    // Use real data if available, otherwise fallback to sample data
    const timelineData = dailyTimeline?.entries?.length ? dailyTimeline : null;

    // Generate colors for different tasks
    const getTaskColor = (taskId: string, index: number) => {
        const colors = [
            { border: 'border-cyan-500', stripe: 'rgba(34, 211, 238, 0.6)' },
            { border: 'border-purple-500', stripe: 'rgba(168, 85, 247, 0.6)' },
            { border: 'border-green-500', stripe: 'rgba(34, 197, 94, 0.6)' },
            { border: 'border-orange-500', stripe: 'rgba(249, 115, 22, 0.6)' },
            { border: 'border-pink-500', stripe: 'rgba(236, 72, 153, 0.6)' },
            { border: 'border-blue-500', stripe: 'rgba(59, 130, 246, 0.6)' },
            { border: 'border-red-500', stripe: 'rgba(239, 68, 68, 0.6)' },
            { border: 'border-yellow-500', stripe: 'rgba(234, 179, 8, 0.6)' }
        ];
        return colors[index % colors.length];
    };

    // Filter out entries with zero duration for cleaner display
    const validEntries = timelineData?.entries?.filter(entry => entry.duration > 0) || [];

    // Generate monthly hours data from timeTracking.hoursByDay or use sample data
    const generateMonthlyHoursData = () => {
        if (timeTracking?.hoursByDay && timeTracking.hoursByDay.length > 0) {
            // Group by month and calculate totals
            const monthlyData: { [key: string]: { hours: number, breakHours: number, overtimeHours: number } } = {};

            timeTracking.hoursByDay.forEach((day: { date: string; plannedHours: number; actualHours: number }) => {
                const date = new Date(day.date);
                const monthKey = date.toLocaleDateString('en-US', { month: 'short' });

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { hours: 0, breakHours: 0, overtimeHours: 0 };
                }

                monthlyData[monthKey].hours += day.actualHours;
                // Calculate break and overtime based on planned vs actual
                const overtime = Math.max(0, day.actualHours - day.plannedHours);
                monthlyData[monthKey].overtimeHours += overtime;
                // Estimate break time as 10% of working hours
                monthlyData[monthKey].breakHours += day.actualHours * 0.1;
            });

            return Object.entries(monthlyData).map(([month, data]) => ({
                month,
                hours: Math.round(data.hours),
                breakHours: Math.round(data.breakHours),
                overtimeHours: Math.round(data.overtimeHours)
            }));
        }

        // Fallback to sample data
        return [
            { month: 'Jan', hours: 280, breakHours: 40, overtimeHours: 15 },
            { month: 'Feb', hours: 320, breakHours: 35, overtimeHours: 25 },
            { month: 'Mar', hours: 300, breakHours: 45, overtimeHours: 10 },
            { month: 'Apr', hours: 350, breakHours: 50, overtimeHours: 30 },
            { month: 'May', hours: 330, breakHours: 40, overtimeHours: 20 },
            { month: 'Jun', hours: 400, breakHours: 60, overtimeHours: 35 },
        ];
    };

    const monthlyHoursData = generateMonthlyHoursData();

    // Helper to generate time labels
    function generateTimeLabels(start = "09:00", end = "17:00", intervalMinutes = 120) {
        const labels = [];
        const [startHour, startMinute] = start.split(":").map(Number);
        const [endHour, endMinute] = end.split(":").map(Number);

        let current = new Date();
        current.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date();
        endTime.setHours(endHour, endMinute, 0, 0);

        while (current <= endTime) {
            labels.push(current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
            current = new Date(current.getTime() + intervalMinutes * 60000);
        }

        return labels;
    }

    const shiftStart = timelineData?.shiftStart || "09:00";
    const shiftEnd = timelineData?.shiftEnd || "17:00";
    const timeLabels = generateTimeLabels(shiftStart, shiftEnd, 120); // 2-hour interval

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            {/* Time Display and Hours Summary */}
            <div className="col-span-12 md:col-span-4 xl:col-span-3">
                <div className="bg-secondary rounded-2xl shadow-lg p-6 border border-tbright/10">
                    {/* Large Timer Display */}
                    <div className="text-center mb-6">
                        <div className="text-4xl sm:text-5xl font-bold text-twhite tracking-tight font-mono">
                            {timeTracking?.totalTimeToday || "00:00:00"}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Worked Hours */}
                            <div className="bg-primary/50  rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-sm">
                                    <Clock className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-tmid mb-1">{t('worked_hours')}</p>
                                    <p className="text-xl font-bold text-twhite">
                                        {timeTracking?.workedHours ? `${timeTracking.workedHours} ${t("hours")}` : `0 ${t(`hours`)}`}
                                    </p>
                                </div>
                            </div>

                            {/* Break Time */}
                            <div className="bg-warning/50  rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-sm">
                                    <Clock className="w-5 h-5 text-warning" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-tmid mb-1">{t('break_time')}</p>
                                    <p className="text-xl font-bold text-twhite">
                                        {timeTracking?.breakTime ? `${timeTracking.breakTime} ${t("hours")}` : `0 ${t(`hours`)}`}
                                    </p>
                                </div>
                            </div>

                            {/* Overtime Hours */}
                            <div className="bg-danger/50  rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-sm">
                                    <Clock className="w-5 h-5 text-danger" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-tmid mb-1">{t('overtime_hours')}</p>
                                    <p className="text-xl font-bold text-twhite">
                                        {timeTracking?.overtimeHours ? `${timeTracking.overtimeHours} ${t("hours")}` : `0 ${t(`hours`)}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Hours Chart */}
            <div className="col-span-12 md:col-span-8 xl:col-span-9">
                <div className="bg-secondary rounded-xl shadow p-4 sm:p-6 h-full">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-twhite">{t('working_hours')}</h2>
                        <button className="bg-main hover:bg-dark text-tmid rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-colors">
                            {t('this_year')}
                        </button>
                    </div>

                    <div className="h-48 sm:h-56 md:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={monthlyHoursData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                                barGap={2}
                                barSize={20}
                            >
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: 'var(--color-tmid)' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: 'var(--color-tmid)' }}
                                    tickCount={6}
                                    domain={[0, 500]}
                                    tickFormatter={(value) => `${value}h`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(224, 231, 255, 0.1)' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: 'var(--color-secondary)',
                                        color: 'var(--color-twhite)'
                                    }}
                                    labelStyle={{ color: 'var(--color-twhite)' }}
                                    itemStyle={{ color: 'var(--color-twhite)' }}
                                />
                                <Bar dataKey="hours" stackId="a" fill="var(--color-primary-hex)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="breakHours" stackId="a" fill="var(--color-warning-hex)" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="overtimeHours" stackId="a" fill="var(--color-danger-hex)" radius={[0, 0, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Highlight label for current month */}
                    <div className="flex justify-center items-center mt-3 sm:mt-4">
                        <div className="bg-secondary/30 px-2 sm:px-3 py-1 rounded-lg">
                            <span className="text-sm text-tmid font-medium">
                                {timeTracking?.workedHours || 0} {t('hours')}
                            </span>
                            <span className="text-xs sm:text-sm text-tmid ml-1 sm:ml-2">
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Timeline (Full width) */}
            <div className="col-span-12">
                <div className="bg-secondary rounded-xl shadow p-4 sm:p-6">
                    <div className="flex items-center mb-6">
                        <Clock size={16} className="text-tmid mr-2" />
                        <h2 className="text-lg font-bold text-twhite">{t('daily_timeline')}</h2>
                    </div>

                    {/* Timeline Container */}
                    <div className="relative">
                        {/* Timeline track */}
                        <div className="relative h-24 bg-main rounded-lg mb-6 overflow-hidden border border-tbright/20">
                            {/* Time grid lines */}
                            <div className="absolute inset-0 flex">
                                {[0, 16.67, 33.33, 50, 66.67, 83.33, 100].map((position, index) => (
                                    <div
                                        key={index}
                                        className="absolute top-0 bottom-0 w-px bg-tbright/10"
                                        style={{ left: `${position}%` }}
                                    />
                                ))}
                            </div>

                            {/* Timeline task blocks with striped pattern */}
                            {validEntries.length > 0 ? (
                                validEntries.map((entry, index) => {
                                    const color = getTaskColor(entry.taskId, index);
                                    return (
                                        <div
                                            key={`${entry.taskId}-${index}`}
                                            className={`absolute top-3 bottom-3 rounded-lg border-2 ${color.border} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer z-10`}
                                            style={{
                                                left: `${entry.position}%`,
                                                width: `${entry.width}%`,
                                                backgroundImage: `repeating-linear-gradient(
                                                    45deg,
                                                    transparent,
                                                    transparent 10px,
                                                    ${color.stripe} 10px,
                                                    ${color.stripe} 16px
                                                )`
                                            }}
                                            title={`${entry.taskName} - ${entry.projectName} (${entry.startTime} - ${entry.endTime})`}
                                        />
                                    );
                                })
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <span className="text-tmid text-sm">{t('no_timeline_data')}</span>
                                </div>
                            )}
                        </div>

                        {/* Time markers below the timeline */}
                        <div className="flex justify-between text-sm text-tmid font-medium">
                            {timeLabels.map((label, idx) => (
                                <span key={idx}>{label}</span>
                            ))}
                        </div>

                        {/* Summary statistics */}
                        <div className="flex justify-center items-center gap-8 mt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                <span className="text-sm text-tmid">
                                    {t('total_working_time')}: <span className="font-medium text-twhite">{timelineData?.totalWorkingTime || 0} {t('hours')}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-warning rounded-full"></div>
                                <span className="text-sm text-tmid">
                                    {t('total_break_time')}: <span className="font-medium text-twhite">{timelineData?.totalBreakTime || 0} {t('hours')}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeTracker;