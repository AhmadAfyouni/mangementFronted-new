import useLanguage from "@/hooks/useLanguage";

// Messages section component - Redesigned with theme colors
const MessagesSection: React.FC = () => {
    const { t } = useLanguage();

    // Sample messages data
    const messages = [
        {
            id: 1,
            sender: { name: 'Brian Adams', initial: 'BA', color: 'bg-tmid' },
            message: t('uploaded_assets'),
            time: '9:30 AM',
            unread: false
        },
        {
            id: 2,
            sender: { name: 'Alice Cooper', initial: 'AC', color: 'bg-tmid' },
            message: t('meeting_schedule'),
            time: '10:15 AM',
            unread: false
        },
        {
            id: 3,
            sender: { name: 'Claire Williams', initial: 'CW', color: 'bg-tmid' },
            message: t('deadline_confirmation'),
            time: '11:45 AM',
            unread: true
        },
        {
            id: 4,
            sender: { name: 'David Smith', initial: 'DS', color: 'bg-tmid' },
            message: t('feedback_review'),
            time: '2:20 PM',
            unread: true
        },
        {
            id: 5,
            sender: { name: 'Eva Green', initial: 'EG', color: 'bg-tmid' },
            message: t('font_issues'),
            time: '3:05 PM',
            unread: true
        }
    ];

    return (
        <div className="bg-secondary rounded-xl shadow p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-twhite">{t('messages')}</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium bg-main text-tmid py-1 px-2 rounded-full">3 {t('new')}</span>
                </div>
            </div>

            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100% - 4rem)' }}>
                {messages.map((message) => (
                    <div key={message.id} className={`flex items-start p-3 rounded-lg ${message.unread ? 'bg-dark' : 'hover:bg-secondary'} transition-colors`}>
                        {/* Avatar */}
                        <div className="relative mx-3 flex-shrink-0">
                            <div className={`w-10 h-10 ${message.sender.color} rounded-full flex items-center justify-center text-tblackAF font-medium`}>
                                {message.sender.initial}
                            </div>
                            {message.unread && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-main" />
                            )}
                        </div>

                        {/* Message content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-semibold text-twhite truncate">{message.sender.name}</h3>
                                <span className="text-xs text-tdark ml-1 whitespace-nowrap">{message.time}</span>
                            </div>
                            <p className="text-sm text-tmid line-clamp-2">{message.message}</p>
                        </div>

                        {/* Unread counter */}
                        {message.unread && (
                            <div className="ml-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-tblackAF text-xs font-bold">
                                1
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center">
                <button className="text-sm text-tmid hover:text-tmid font-medium transition-colors">
                    {t('view_all_messages')}
                </button>
            </div>
        </div>
    );
};

export default MessagesSection;