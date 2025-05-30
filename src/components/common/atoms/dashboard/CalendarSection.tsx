import useLanguage from "@/hooks/useLanguage";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Interface for event data
interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    type: 'meeting' | 'deadline' | 'reminder';
    color?: string;
}

// Enhanced CalendarSection component with react-datepicker
const CalendarSection: React.FC = () => {
    const { t } = useLanguage();
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // Tasks for specific dates (mock data)
    const [taskDates, setTaskDates] = useState<Record<string, number>>({});

    // Events for specific dates (mock data)
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    // Selected events based on selected date
    const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

    useEffect(() => {
        // Setup some sample task data
        setTaskDates({
            // Use date string in YYYY-MM-DD format as keys
            [new Date(2025, 4, 3).toISOString().split('T')[0]]: 4,  // May 3rd has 4 tasks
            [new Date(2025, 4, 8).toISOString().split('T')[0]]: 2,  // May 8th has 2 tasks
            [new Date(2025, 4, 15).toISOString().split('T')[0]]: 3, // May 15th has 3 tasks
            [new Date(2025, 4, 19).toISOString().split('T')[0]]: 1, // May 19th has 1 task
            [new Date(2025, 4, 25).toISOString().split('T')[0]]: 2  // May 25th has 2 tasks
        });

        // Setup sample event data
        setEvents([
            {
                id: '1',
                title: 'Team Meeting',
                date: new Date(2025, 4, 3, 10, 0),
                type: 'meeting',
                color: 'var(--color-primary-hex)'
            },
            {
                id: '2',
                title: 'Project Deadline',
                date: new Date(2025, 4, 15, 16, 0),
                type: 'deadline',
                color: 'var(--color-danger-hex)'
            },
            {
                id: '3',
                title: 'Client Call',
                date: new Date(2025, 4, 8, 14, 30),
                type: 'meeting',
                color: 'var(--color-primary-hex)'
            },
            {
                id: '4',
                title: 'Submit Report',
                date: new Date(2025, 4, 19, 9, 0),
                type: 'deadline',
                color: 'var(--color-danger-hex)'
            },
            {
                id: '5',
                title: 'Review Session',
                date: new Date(2025, 4, 25, 11, 0),
                type: 'meeting',
                color: 'var(--color-primary-hex)'
            },
            {
                id: '6',
                title: 'Weekly Check-in',
                date: new Date(2025, 4, 3, 15, 0),
                type: 'reminder',
                color: 'var(--color-warning-hex)'
            }
        ]);
    }, []);

    // Update selected events when date changes
    useEffect(() => {
        if (selectedDate) {
            const dateString = selectedDate.toISOString().split('T')[0];
            const eventsOnDate = events.filter(event =>
                event.date.toISOString().split('T')[0] === dateString
            );
            setSelectedEvents(eventsOnDate);
        } else {
            setSelectedEvents([]);
        }
    }, [selectedDate, events]);

    // Custom day renderer for the DatePicker
    const renderDayContents = (day: number, date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        const taskCount = taskDates[dateString];

        // Check if there are events on this day
        const eventsOnDate = events.filter(event =>
            event.date.toISOString().split('T')[0] === dateString
        );

        // Get unique colors - fixing the Set iteration TypeScript error
        const eventColors: string[] = [];
        eventsOnDate.forEach(event => {
            if (event.color && !eventColors.includes(event.color)) {
                eventColors.push(event.color);
            }
        });

        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <span className="text-twhite">{day}</span>

                {/* Event indicators */}
                {eventsOnDate.length > 0 && (
                    <div className="absolute -top-1 right-1">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: eventColors[0] || 'var(--color-primary-hex)',
                                boxShadow: eventColors.length > 1 ? '1px 1px 0 var(--color-secondary)' : 'none'
                            }}
                        ></div>
                    </div>
                )}

                {/* Task indicators */}
                {taskCount && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {Array(Math.min(taskCount, 3)).fill(0).map((_, i) => (
                            <div
                                key={i}
                                className="w-1 h-1 rounded-full bg-primary"
                            ></div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Handle date change with proper typing for nullable dates
    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
    };

    // Format time from Date object to display time
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Get event type icon
    const getEventTypeIcon = (type: string) => {
        switch (type) {
            case 'meeting':
                return '🗓️';
            case 'deadline':
                return '⏰';
            case 'reminder':
                return '📝';
            default:
                return '•';
        }
    };

    return (
        <div className="bg-secondary rounded-xl shadow p-4 sm:p-6">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-twhite">{t('calendar')}</h2>
            </div>

            {/* Calendar and Events Layout */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Calendar Section */}
                <div className="flex-1 lg:max-w-sm">
                    <div className="calendar-wrapper flex justify-center lg:justify-start">
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            inline
                            renderDayContents={renderDayContents}
                            calendarClassName="custom-calendar"
                            wrapperClassName="custom-calendar-wrapper"
                            dayClassName={() => 'custom-day'}
                            monthClassName={() => 'custom-month'}
                            weekDayClassName={() => 'custom-weekday'}
                        />
                    </div>
                </div>

                {/* Events Section */}
                <div className="flex-1 lg:max-w-xs">
                    <div className="bg-secondary/40 rounded-lg p-3 sm:p-4 h-full min-h-[280px] sm:min-h-[320px]">
                        <h3 className="text-base sm:text-lg font-medium text-twhite mb-3 sm:mb-4">
                            {selectedDate ? selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : t('select_date')}
                        </h3>

                        {selectedEvents.length > 0 ? (
                            <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                                {selectedEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className="bg-main/60 rounded-lg p-2 sm:p-3 border-l-4"
                                        style={{ borderColor: event.color }}
                                    >
                                        <div className="flex items-start">
                                            <span className="mr-2 text-base sm:text-lg flex-shrink-0">{getEventTypeIcon(event.type)}</span>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-twhite text-sm sm:text-base truncate">{event.title}</h4>
                                                <p className="text-xs sm:text-sm text-tmid">{formatTime(event.date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-32 sm:h-40 text-tmid">
                                <p className="text-sm sm:text-base text-center">{t('no_events')}</p>
                                <button className="mt-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-main text-twhite rounded-lg text-xs sm:text-sm hover:bg-primary/80 transition-colors">
                                    {t('add_event')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                /* Custom theme styles for the DatePicker */
                .custom-calendar {
                    width: 100% !important;
                    max-width: 320px !important;
                    background-color: var(--color-main) !important;
                    border: none !important;
                    font-family: inherit;
                    border-radius: 12px !important;
                    overflow: hidden;
                }
                
                .custom-calendar-wrapper {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                }
                
                /* Mobile optimizations */
                @media (max-width: 640px) {
                    .custom-calendar {
                        max-width: 100% !important;
                        min-width: 280px !important;
                        font-size: 14px;
                    }
                    
                    .custom-calendar .react-datepicker__day {
                        width: 30px !important;
                        height: 30px !important;
                        line-height: 30px !important;
                        margin: 1px !important;
                        font-size: 13px !important;
                    }
                    
                    .custom-calendar .react-datepicker__day-name {
                        width: 30px !important;
                        margin: 1px !important;
                        font-size: 11px !important;
                    }
                    
                    .custom-calendar .react-datepicker__current-month {
                        font-size: 16px !important;
                        margin-bottom: 8px !important;
                    }
                    
                    .custom-calendar .react-datepicker__navigation {
                        top: 10px !important;
                    }
                }
                
                /* Tablet optimizations */
                @media (min-width: 641px) and (max-width: 1023px) {
                    .custom-calendar {
                        max-width: 300px !important;
                    }
                    
                    .custom-calendar .react-datepicker__day {
                        width: 34px !important;
                        height: 34px !important;
                        line-height: 34px !important;
                        margin: 1.5px !important;
                    }
                    
                    .custom-calendar .react-datepicker__day-name {
                        width: 34px !important;
                        margin: 1.5px !important;
                    }
                }
                
                /* Desktop styles */
                @media (min-width: 1024px) {
                    .custom-calendar {
                        max-width: 320px !important;
                    }
                    
                    .custom-calendar .react-datepicker__day {
                        width: 36px !important;
                        height: 36px !important;
                        line-height: 36px !important;
                        margin: 2px !important;
                    }
                    
                    .custom-calendar .react-datepicker__day-name {
                        width: 36px !important;
                        margin: 2px !important;
                    }
                }
                
                .custom-calendar .react-datepicker__header {
                    background-color: var(--color-dark) !important;
                    border-bottom: 1px solid var(--color-secondary) !important;
                    padding: 12px 8px 8px 8px;
                    border-radius: 12px 12px 0 0 !important;
                }
                
                .custom-calendar .react-datepicker__current-month {
                    color: var(--color-twhite) !important;
                    font-weight: bold;
                    font-size: 1.1rem;
                    margin-bottom: 8px;
                }
                
                .custom-calendar .react-datepicker__day-name {
                    color: var(--color-tmid) !important;
                    font-weight: 500;
                    font-size: 12px;
                }
                
                .custom-calendar .react-datepicker__day {
                    color: var(--color-twhite) !important;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    font-weight: 500;
                }
                
                .custom-calendar .react-datepicker__day:hover {
                    background-color: var(--color-secondary) !important;
                    transform: scale(1.05);
                }
                
                .custom-calendar .react-datepicker__day--selected {
                    background-color: var(--color-primary-hex) !important;
                    color: white !important;
                    font-weight: bold;
                    transform: scale(1.1);
                    box-shadow: 0 2px 8px rgba(38, 132, 255, 0.3);
                }
                
                .custom-calendar .react-datepicker__day--today {
                    position: relative;
                    font-weight: bold;
                    background-color: var(--color-secondary) !important;
                }
                
                .custom-calendar .react-datepicker__day--today::after {
                    content: '';
                    position: absolute;
                    bottom: 2px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    background-color: var(--color-primary-hex);
                    border-radius: 50%;
                }
                
                .custom-calendar .react-datepicker__day--outside-month {
                    color: var(--color-tdark) !important;
                    opacity: 0.4;
                }
                
                .custom-calendar .react-datepicker__navigation {
                    top: 14px;
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                }
                
                .custom-calendar .react-datepicker__navigation:hover {
                    background-color: var(--color-secondary);
                }
                
                .custom-calendar .react-datepicker__navigation-icon::before {
                    border-color: var(--color-tmid);
                    border-width: 2px 2px 0 0;
                    width: 6px;
                    height: 6px;
                }
                
                .custom-calendar .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
                    border-color: var(--color-twhite);
                }
                
                .custom-calendar .react-datepicker__month-container {
                    width: 100%;
                }
                
                .custom-calendar .react-datepicker__month {
                    margin: 0;
                    padding: 8px;
                }
                
                .custom-calendar .react-datepicker__week {
                    display: flex;
                    justify-content: space-between;
                }
            `}</style>
        </div>
    );
};

export default CalendarSection;