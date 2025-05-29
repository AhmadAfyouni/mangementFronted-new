import { useDashboard } from "@/hooks/useDashboard";
import useLanguage from "@/hooks/useLanguage";
import { DailyTimelineResponse, TimelineEntry } from "@/types/dashboard.type";
import { Clock } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Time Tracker Components
const TimeTracker: React.FC = () => {
    const { t } = useLanguage();
    const { useDashboardData } = useDashboard();
    const { data: dashboardData, isLoading } = useDashboardData();

    // Get timeline data from the hook
    const dailyTimeline = dashboardData?.dailyTimeline as DailyTimelineResponse;
    const timeTracking = dashboardData?.timeTracking;

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

    // Sample monthly hours data for the chart
    const monthlyHoursData = [
        { month: 'Jan', hours: 280, breakHours: 40, overtimeHours: 15 },
        { month: 'Feb', hours: 320, breakHours: 35, overtimeHours: 25 },
        { month: 'Mar', hours: 300, breakHours: 45, overtimeHours: 10 },
        { month: 'Apr', hours: 350, breakHours: 50, overtimeHours: 30 },
        { month: 'May', hours: 330, breakHours: 40, overtimeHours: 20 },
        { month: 'Jun', hours: 400, breakHours: 60, overtimeHours: 35 },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            {/* Time Display and Hours Summary */}
            <div className="col-span-12 md:col-span-4 xl:col-span-3">
                <div className="bg-secondary rounded-xl shadow p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-twhite mb-3 sm:mb-4">{t('time_tracker')}</h2>

                    {/* Current Time Display */}
                    <div className="text-xl sm:text-4xl md:text-2xl lg:text-5xl font-bold text-twhite border-2 border-tbright rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 text-center">
                        {timeTracking?.totalTimeToday || "00:00:00"}
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-6 sm:py-8">
                            <p className="text-tmid">{t('loading')}...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <div className="bg-main rounded-lg p-2 sm:p-3 text-center">
                                <p className="text-xs sm:text-sm text-tmid mb-1">{t('worked_hours')}</p>
                                <p className="text-sm sm:text-lg font-bold text-twhite">
                                    {timeTracking?.workedHours || "0h"}
                                </p>
                            </div>
                            <div className="bg-main rounded-lg p-2 sm:p-3 text-center">
                                <p className="text-xs sm:text-sm text-tmid mb-1">{t('break_time')}</p>
                                <p className="text-sm sm:text-lg font-bold text-twhite">
                                    {timeTracking?.breakTime || "0h"}
                                </p>
                            </div>
                            <div className="bg-main rounded-lg p-2 sm:p-3 text-center">
                                <p className="text-xs sm:text-sm text-tmid mb-1">{t('overtime_hours')}</p>
                                <p className="text-sm sm:text-lg font-bold text-twhite">
                                    {timeTracking?.overtimeHours || "0h"}
                                </p>
                            </div>
                            <div className="bg-main rounded-lg p-2 sm:p-3 text-center">
                                <p className="text-xs sm:text-sm text-tmid mb-1">{t('working_hours')}</p>
                                <p className="text-sm sm:text-lg font-bold text-twhite">
                                    8h
                                </p>
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
                                <Bar dataKey="hours" stackId="a" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="breakHours" stackId="a" fill="var(--color-warning)" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="overtimeHours" stackId="a" fill="var(--color-danger)" radius={[0, 0, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Highlight label for current month */}
                    <div className="flex justify-center items-center mt-3 sm:mt-4">
                        <div className="bg-secondary/30 px-2 sm:px-3 py-1 rounded-lg">
                            <span className="text-sm text-tmid font-medium">300 {t('hours')}</span>
                            <span className="text-xs sm:text-sm text-tmid ml-1 sm:ml-2">March, 2025</span>
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
                            <span>{timelineData?.shiftStart || "07:00"}</span>
                            <span>09:00</span>
                            <span>11:00</span>
                            <span>13:00</span>
                            <span>15:00</span>
                            <span>17:00</span>
                            <span>{timelineData?.shiftEnd || "19:00"}</span>
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