import { useDashboard } from "@/hooks/useDashboard";
import useLanguage from "@/hooks/useLanguage";
import { CalendarIcon, FolderOpen, TrendingUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Projects section component - Redesigned
const ProjectsSection: React.FC = () => {
    const { t } = useLanguage();
    const { useProjectStats } = useDashboard();
    const { data: projectStats, isLoading, error } = useProjectStats();

    // Map colors to projects based on index
    const colorClasses = ['bg-red-400', 'bg-amber-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400'];
    const colorValues = ['red-400', 'amber-400', 'green-400', 'blue-400', 'purple-400'];

    // Transform project stats for the chart if data exists
    const chartData = projectStats?.map((project, index) => ({
        name: project.name.length > 10 ? project.name.substring(0, 10) + '...' : project.name,
        hours: project.hoursSpent,
        color: colorValues[index % colorValues.length]
    })) || [];

    return (
        <div className="bg-secondary rounded-xl shadow p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-twhite flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-blue-400" />
                    {t('projects')}
                </h2>
                <div className="flex gap-2">
                    <button className="bg-main hover:bg-dark text-tmid rounded-lg px-3 py-1.5 flex items-center text-sm font-medium transition-colors">
                        <CalendarIcon size={16} className="mx-1.5" />
                        <span>{t('this_week')}</span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-72">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                        <p className="text-twhite">{t('loading')}</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-72">
                    <div className="text-center">
                        <div className="text-red-400 mb-2">⚠️</div>
                        <p className="text-red-400">{t('Error loading data')}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                        >
                            {t('Try Again')}
                        </button>
                    </div>
                </div>
            ) : !projectStats || projectStats.length === 0 ? (
                <div className="flex items-center justify-center h-72">
                    <div className="text-center">
                        <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-lg text-gray-400 mb-2">{t('No projects found')}</p>
                        <p className="text-sm text-gray-500">{t('Create your first project to get started')}</p>
                    </div>
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
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: '#1f2937',
                                        color: '#f9fafb'
                                    }}
                                    formatter={(value: number) => [`${value}h`, 'Hours Spent']}
                                />
                                <Bar
                                    dataKey="hours"
                                    radius={[4, 4, 0, 0]}
                                    barSize={36}
                                    fill="#3b82f6"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend and Stats */}
                    <div className="mt-4">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {projectStats?.slice(0, 4).map((project, index) => (
                                <div key={project.id} className="flex items-center">
                                    <div className={`w-3 h-3 ${colorClasses[index % colorClasses.length]} rounded-sm mx-2`}></div>
                                    <span className="text-xs text-tmid truncate" title={project.name}>
                                        {project.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Summary Stats */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <TrendingUp className="w-4 h-4" />
                                <span>{t('Total Projects')}: {projectStats.length}</span>
                            </div>
                            <div className="text-sm text-gray-400">
                                {projectStats.reduce((total, project) => total + project.hoursSpent, 0)}h {t('total')}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProjectsSection;