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
                        /* Hours Summary Cards */
                        <div className="space-y-3">
                            <div className="flex items-center p-3 sm:p-4 bg-primary-100 rounded-xl border border-primary-200">
                                <div className="p-2 sm:p-3 bg-white rounded-full mx-2 sm:mx-3">
                                    <Clock size={16} className="text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs sm:text-sm text-tblack">{t('worked_hours')}</div>
                                    <div className="text-base sm:text-lg md:text-xl font-bold text-tfblack">
                                        {timeTracking?.workedHours || 0} {t('hours')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center p-3 sm:p-4 bg-warning-100 rounded-xl border border-warning-200">
                                <div className="p-2 sm:p-3 bg-white rounded-full mx-2 sm:mx-3">
                                    <Clock size={16} className="text-warning" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs sm:text-sm text-tblack">{t('break_time')}</div>
                                    <div className="text-base sm:text-lg md:text-xl font-bold text-tfblack">
                                        {timeTracking?.breakTime || 0} {t('hours')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center p-3 sm:p-4 bg-danger-100 rounded-xl border border-danger-200">
                                <div className="p-2 sm:p-3 bg-white rounded-full mx-2 sm:mx-3">
                                    <Clock size={16} className="text-danger" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs sm:text-sm text-tblack">{t('overtime_hours')}</div>
                                    <div className="text-base sm:text-lg md:text-xl font-bold text-tfblack">
                                        {timeTracking?.overtimeHours || 0} {t('hours')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hours Chart */}
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
                    <div className="flex items-center mb-4 sm:mb-6">
                        <Clock size={16} className="text-icons mx-2" />
                        <h2 className="text-base sm:text-lg font-bold text-twhite">{t('daily_timeline')}</h2>
                    </div>

                    <div className="relative h-12 sm:h-14 mb-8 sm:mb-10">
                        {/* Timeline task blocks from the dailyTimeline data */}
                        {dailyTimeline?.entries && dailyTimeline.entries.map((entry: TimelineEntry, index: number) => {
                            // Use the position and width from the API data
                            const isFirstHalf = index % 2 === 0;
                            const colorClass = isFirstHalf
                                ? 'bg-primary-opacity-80 border border-primary'  // Using 80% opacity
                                : 'bg-warning-opacity-80 border border-warning';  // Using 80% opacity

                            return (
                                <div
                                    key={index}
                                    className={`absolute top-0 h-full ${colorClass} rounded-lg`}
                                    style={{
                                        left: `${entry.position}%`,
                                        width: `${entry.width}%`
                                    }}
                                    title={`${entry.taskName} - ${entry.projectName}`}
                                >
                                    {/* For larger screens, show task name inside the timeline block if width allows */}
                                    {entry.width > 15 && (
                                        <div className="hidden sm:block whitespace-nowrap overflow-hidden text-ellipsis px-2 text-xs text-twhite">
                                            {entry.taskName}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Fallback message if no entries */}
                        {(!dailyTimeline?.entries || dailyTimeline.entries.length === 0) && !isLoading && (
                            <div className="flex justify-center items-center h-full text-xs sm:text-sm text-tmid">
                                {t('no_timeline_entries')}
                            </div>
                        )}

                        {/* Time markers - using shift start and end times if available */}
                        <div className="absolute -bottom-6 sm:-bottom-8 left-0 right-0 flex justify-between text-2xs sm:text-xs text-tmid">
                            <div>{dailyTimeline?.shiftStart?.split(':').slice(0, 2).join(':') || '00:00'}</div>
                            <div>04:00</div>
                            <div>08:00</div>
                            <div>12:00</div>
                            <div>16:00</div>
                            <div>20:00</div>
                            <div>{dailyTimeline?.shiftEnd?.split(':').slice(0, 2).join(':') || '24:00'}</div>
                        </div>
                    </div>

                    {/* Summary statistics */}
                    {dailyTimeline && (
                        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mt-4">
                            <div className="bg-secondary/30 px-2 sm:px-3 py-1 rounded-lg">
                                <span className="text-xs sm:text-sm text-tmid">
                                    {t('total_working_time')}: <span className="font-medium">{dailyTimeline.totalWorkingTime || 0}</span> {t('hours')}
                                </span>
                            </div>
                            <div className="bg-secondary/30 px-2 sm:px-3 py-1 rounded-lg">
                                <span className="text-xs sm:text-sm text-tmid">
                                    {t('total_break_time')}: <span className="font-medium">{dailyTimeline.totalBreakTime || 0}</span> {t('hours')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimeTracker;