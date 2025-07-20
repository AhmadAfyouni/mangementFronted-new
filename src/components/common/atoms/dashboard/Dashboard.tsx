"use client";

import { useDashboard } from "@/hooks/useDashboard";
import useLanguage from "@/hooks/useLanguage";
import {
    CheckCircle,
    Clock,
    Pause,
    SquareStack
} from "lucide-react";
import CalendarSection from "./CalendarSection";
import DailyTasks from "./DailyTasks";
import MyTasks from "./MyTasks";
import ProjectsSection from "./ProjectsSection";
import RecentActivity from "./RecentActivity";
import TaskSummaryCard from "./TaskSummaryCard";
import TimeTracker from "./TimeTracker";

const Dashboard = () => {
    const { t } = useLanguage();

    const { useDashboardData } = useDashboard();
    const { data, isLoading } = useDashboardData();

    return (
        <div className="min-h-screen bg-main">
            {/* Main Content */}
            <div className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-10 pt-4 sm:pt-6">
                {/* Welcome Section */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-twhite">{t('welcome')}</h1>
                    <p className="text-xs sm:text-sm md:text-base text-twhite mt-1">{t('welcome_subtitle')}</p>
                </div>

                {/* Task Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
                    <TaskSummaryCard
                        title={t('total')}
                        count={data?.taskSummary?.total ?? 0}
                        color="bg-warning"
                        icon={<SquareStack size={20} className="text-white" />}
                        bgColor="bg-gradient-to-br from-warning to-warning-600"
                        textColor="text-white"
                    />
                    <TaskSummaryCard
                        title={t('pending')}
                        count={data?.taskSummary?.pending ?? 0}
                        color="bg-purple-400"
                        icon={<Pause size={20} className="text-white" />}
                        bgColor="bg-gradient-to-br from-purple-400 to-purple-600"
                        textColor="text-white"
                    />
                    <TaskSummaryCard
                        title={t('in_progress')}
                        count={data?.taskSummary?.inProgress ?? 0}
                        color="bg-primary"
                        icon={<Clock size={20} className="text-white" />}
                        bgColor="bg-gradient-to-br from-primary to-primary-600"
                        textColor="text-white"
                    />
                    <TaskSummaryCard
                        title={t('completed')}
                        count={data?.taskSummary?.completed ?? 0}
                        color="bg-success"
                        icon={<CheckCircle size={20} className="text-white" />}
                        bgColor="bg-gradient-to-br from-success to-success-600"
                        textColor="text-white"
                    />
                </div>

                {/* Calendar & Daily Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                    <div className="col-span-1">
                        <CalendarSection />
                    </div>
                    <div className="col-span-1">
                        <DailyTasks
                            dailyTasks={data?.dailyTasks || []}
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                {/* Time Tracker Section */}
                <TimeTracker
                    dailyTimeline={data?.dailyTimeline}
                    timeTracking={data?.timeTracking}
                    isLoading={isLoading}
                />

                {/* Projects and Messages */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                    {/* Projects Section */}
                    <div className="col-span-1 lg:col-span-2">
                        <ProjectsSection />
                    </div>

                    {/* Messages */}
                    {/* <div className="col-span-1">
                        <MessagesSection />
                    </div> */}
                    {/* Recent Activity */}
                    <div className="col-span-1">
                        <RecentActivity />
                    </div>
                </div>

                {/* My Tasks and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {/* My Tasks */}
                    <div className="col-span-2 lg:col-span-3">
                        <MyTasks />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;