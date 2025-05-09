import { useDashboard } from "@/hooks/useDashboard";
import useLanguage from "@/hooks/useLanguage";
import { CalendarIcon } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Projects section component - Redesigned
const ProjectsSection: React.FC = () => {
    const { t } = useLanguage();
    const { useProjectStats } = useDashboard();
    const { data: projectStats, isLoading } = useProjectStats();

    // Map colors to projects based on index
    const colorClasses = ['bg-red-400', 'bg-amber-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400'];

    // Transform project stats for the chart if data exists
    const chartData = projectStats?.map((project, index) => ({
        name: project.name,
        hours: project.hoursSpent,
        color: colorClasses[index % colorClasses.length].replace('bg-', '')
    })) || [];

    return (
        <div className="bg-secondary rounded-xl shadow p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-twhite   ">{t('projects')}</h2>
                <div className="flex gap-2">
                    <button className="bg-main hover:bg-dark text-tmid rounded-lg px-3 py-1.5 flex items-center text-sm font-medium transition-colors">
                        <CalendarIcon size={16} className="mx-1.5" />
                        <span>{t('this_week')}</span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-72">
                    <p className="text-twhite">{t('loading')}</p>
                </div>
            ) : (
                <>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                            >
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    tickFormatter={(value) => `${value}h`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(224, 231, 255, 0.2)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar
                                    dataKey="hours"
                                    radius={[4, 4, 0, 0]}
                                    barSize={36}
                                >
                                    {chartData.map((entry, index) => (
                                        <rect
                                            key={`rect-${index}`}
                                            fill={`var(--tw-${entry.color})`}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {projectStats?.slice(0, 4).map((project, index) => (
                            <div key={project.id} className="flex items-center">
                                <div className={`w-3 h-3 ${colorClasses[index % colorClasses.length]} rounded-sm mx-2`}></div>
                                <span className="text-xs text-tmid truncate">{project.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProjectsSection;