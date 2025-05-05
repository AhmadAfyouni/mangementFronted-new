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
                color: 'var(--color-primary)'
            },
            {
                id: '2',
                title: 'Project Deadline',
                date: new Date(2025, 4, 15, 16, 0),
                type: 'deadline',
                color: 'var(--color-danger)'
            },
            {
                id: '3',
                title: 'Client Call',
                date: new Date(2025, 4, 8, 14, 30),
                type: 'meeting',
                color: 'var(--color-primary)'
            },
            {
                id: '4',
                title: 'Submit Report',
                date: new Date(2025, 4, 19, 9, 0),
                type: 'deadline',
                color: 'var(--color-danger)'
            },
            {
                id: '5',
                title: 'Review Session',
                date: new Date(2025, 4, 25, 11, 0),
                type: 'meeting',
                color: 'var(--color-primary)'
            },
            {
                id: '6',
                title: 'Weekly Check-in',
                date: new Date(2025, 4, 3, 15, 0),
                type: 'reminder',
                color: 'var(--color-warning)'
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
                                backgroundColor: eventColors[0] || 'var(--color-primary)',
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
        <div className="bg-secondary rounded-xl shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                <div className="md:col-span-4">
                    <div className="calendar-wrapper">
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

                <div className="md:col-span-3">
                    <div className="bg-secondary/40 rounded-lg p-4 h-full">
                        <h3 className="text-lg font-medium text-twhite mb-3">
                            {selectedDate ? selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : t('select_date')}
                        </h3>

                        {selectedEvents.length > 0 ? (
                            <div className="gap-3">
                                {selectedEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className="bg-main/60 rounded-lg p-3 border-l-4"
                                        style={{ borderColor: event.color }}
                                    >
                                        <div className="flex items-start">
                                            <span className="mx-2 text-lg">{getEventTypeIcon(event.type)}</span>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-twhite">{event.title}</h4>
                                                <p className="text-sm text-tmid">{formatTime(event.date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-tmid">
                                <p>{t('no_events')}</p>
                                <button className="mt-2 px-4 py-2 bg-main text-twhite rounded-lg text-sm hover:bg-primary/80 transition-colors">
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
                    width: 293px;
                    background-color: var(--color-main) !important;
                    border: none !important;
                    font-family: inherit;
                }
                
                .custom-calendar .react-datepicker__header {
                    background-color: var(--color-dark) !important;
                    border-bottom: 1px solid var(--color-dark) !important;
                    padding-top: 12px;
                    padding-bottom: 8px;
                }
                
                .custom-calendar .react-datepicker__current-month {
                    color: var(--color-twhite) !important;
                    font-weight: bold;
                    font-size: 1rem;
                    margin-bottom: 8px;
                }
                
                .custom-calendar .react-datepicker__day-name {
                    color: var(--color-tmid) !important;
                    font-weight: 500;
                    width: 36px;
                    margin: 2px;
                }
                
                .custom-calendar .react-datepicker__day {
                    color: var(--color-twhite) !important;
                    width: 36px;
                    height: 36px;
                    line-height: 36px;
                    margin: 2px;
                    border-radius: 8px;
                }
                
                .custom-calendar .react-datepicker__day:hover {
                    background-color: var(--color-secondary) !important;
                }
                
                .custom-calendar .react-datepicker__day--selected {
                    background-color: var(--color-primary) !important;
                    color: white !important;
                    font-weight: bold;
                }
                
                .custom-calendar .react-datepicker__day--today {
                    position: relative;
                    font-weight: bold;
                }
                
                .custom-calendar .react-datepicker__day--outside-month {
                    color: var(--color-tdark) !important;
                    opacity: 0.5;
                }
                
                .custom-calendar .react-datepicker__navigation {
                    top: 12px;
                }
                
                .custom-calendar .react-datepicker__navigation-icon::before {
                    border-color: var(--color-tmid);
                }
                
                .custom-calendar .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
                    border-color: var(--color-twhite);
                }
            `}</style>
        </div>
    );
};

export default CalendarSection;