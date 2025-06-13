interface CollapsibleCardProps {
    title: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    count?: number;
    iconBgColor?: string;
    iconTextColor?: string;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
    title,
    icon,
    isOpen,
    onToggle,
    children,
    count,
    iconBgColor = "bg-purple-600/20",
    iconTextColor = "text-purple-400",
}) => {
    return (
        <div className="bg-secondary rounded-xl shadow-lg border border-gray-700 overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-dark/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${iconBgColor}`}>
                        <div className={`w-5 h-5 ${iconTextColor}`}>
                            {icon}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-twhite">{title}</h3>
                        {count !== undefined && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2.5 py-1 rounded-full font-medium">
                                    {count} {count === 1 ? 'field' : 'fields'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className={`p-2 rounded-lg transition-all duration-200 ${isOpen ? 'bg-purple-600/20 rotate-180' : 'bg-gray-700/50'}`}>
                    <svg
                        className={`w-5 h-5 transition-colors ${isOpen ? 'text-purple-400' : 'text-gray-400'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="border-t border-gray-700">
                    <div className="p-5">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollapsibleCard;