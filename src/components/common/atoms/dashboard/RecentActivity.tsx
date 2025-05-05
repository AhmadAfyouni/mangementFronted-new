import { useDashboard } from "@/hooks/useDashboard";
import useLanguage from "@/hooks/useLanguage";
import { CheckCircle, ChevronDown, Clock, MessageSquare, MoreHorizontal, Play, Plus, Upload } from "lucide-react";

export interface RecentActivity {
    id: string;
    type: 'comment' | 'status_change' | 'task_created' | 'file_upload' | 'timer_action';
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
    content: string;
    taskId: string;
    taskName: string;
    timestamp: Date;
}

// Recent Activity Component
const RecentActivity: React.FC = () => {
    const { t } = useLanguage();
    const { useRecentActivity } = useDashboard();
    const { data: activities, isLoading } = useRecentActivity();

    // Function to get icon based on activity type
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'file_upload':
                return (
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Upload size={16} className="text-blue-500" />
                    </div>
                );
            case 'status_change':
                return (
                    <div className="bg-amber-100 p-2 rounded-full">
                        <CheckCircle size={16} className="text-amber-500" />
                    </div>
                );
            case 'task_created':
                return (
                    <div className="bg-green-100 p-2 rounded-full">
                        <Plus size={16} className="text-green-500" />
                    </div>
                );
            case 'timer_action':
                return (
                    <div className="bg-indigo-100 p-2 rounded-full">
                        <Play size={16} className="text-indigo-500" />
                    </div>
                );
            case 'comment':
                return (
                    <div className="bg-purple-100 p-2 rounded-full">
                        <MessageSquare size={16} className="text-purple-500" />
                    </div>
                );
            default:
                return (
                    <div className="bg-gray-100 p-2 rounded-full">
                        <Clock size={16} className="text-tmid" />
                    </div>
                );
        }
    };

    // Function to format date for grouping
    const formatDateForGroup = (timestamp: Date): string => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const date = new Date(timestamp);

        if (date.toDateString() === today.toDateString()) {
            return t('today');
        } else if (date.toDateString() === yesterday.toDateString()) {
            return t('yesterday');
        } else {
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
    };

    // Function to format time
    const formatTime = (timestamp: Date): string => {
        return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // Group activities by date
    const groupedActivities = activities?.reduce((acc, activity) => {
        const dateGroup = formatDateForGroup(new Date(activity.timestamp));
        if (!acc[dateGroup]) {
            acc[dateGroup] = [];
        }
        acc[dateGroup].push(activity);
        return acc;
    }, {} as Record<string, RecentActivity[]>) || {};

    if (isLoading) {
        return (
            <div className="bg-secondary rounded-xl shadow p-6 h-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-twhite">{t('recent_activity')}</h2>
                </div>
                <div className="flex justify-center items-center h-64">
                    <p className="text-tmid">{t('loading')}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-secondary rounded-xl shadow p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-twhite">{t('recent_activity')}</h2>
                {activities && activities.length > 0 && (
                    <div className="text-center">
                        <button className="text-sm bg-main hover:bg-dark text-tmid rounded-lg px-3 py-1.5  font-medium transition-colors">
                            {t('view_all_activity')}
                        </button>
                    </div>
                )}
            </div>

            {/* Activity timeline */}
            <div className="space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 4rem)' }}>
                {activities && activities.length > 0 ? (
                    Object.entries(groupedActivities).map(([date, dateActivities]) => (
                        <div key={date}>
                            <h3 className="text-sm font-semibold text-tmid mb-4 flex items-center">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full mx-2"></div>
                                {date}
                            </h3>
                            <div className="space-y-6">
                                {dateActivities.map((activity, index) => (
                                    <div key={activity.id} className="flex group">
                                        {/* Icon */}
                                        <div className="mx-4 flex-shrink-0 relative">
                                            {getActivityIcon(activity.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h4 className="text-sm font-medium text-twhite">
                                                    <span className="font-semibold">{activity.user.name}</span> {activity.content}
                                                </h4>
                                                <span className="text-xs text-gray-400">{formatTime(new Date(activity.timestamp))}</span>
                                            </div>
                                            <p className="text-sm text-tmid mt-1">
                                                {t('task')}: {activity.taskName}
                                            </p>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-tmid">{t('no_recent_activity')}</p>
                    </div>
                )}
            </div>


        </div>
    );
};

export default RecentActivity;