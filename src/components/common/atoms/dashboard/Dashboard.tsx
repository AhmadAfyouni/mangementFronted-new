"use client";

import useLanguage from "@/hooks/useLanguage";
import {
    CheckCircle,
    Clock,
    Pause,
    SquareStack
} from "lucide-react";
import CalendarSection from "./CalendarSection";
import MessagesSection from "./MessagesSectiont";
import MyTasks from "./MyTasks";
import ProjectsSection from "./ProjectsSection";
import RecentActivity from "./RecentActivity";
import TaskSummaryCard from "./TaskSummaryCard";
import TimeTracker from "./TimeTracker";
import { useDashboard } from "@/hooks/useDashboard";
import DailyTasks from "./DailyTasks";

const Dashboard = () => {
    const { t } = useLanguage();

    const { useDashboardData } = useDashboard();
    const { data } = useDashboardData();

    return (
        <div className="min-h-screen bg-main">
            {/* Main Content */}
            <div className="container mx-auto px-4 pb-10 pt-6">
                {/* Welcome Section */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-twhite">{t('welcome')}</h1>
                    <p className="text-sm sm:text-base text-twhite mt-1">{t('welcome_subtitle')}</p>
                </div>

                {/* Task Summary Cards */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="col-span-1 lg:col-span-1">
                        <CalendarSection />
                    </div>
                    <div className="col-span-1 lg:col-span-1">
                        <DailyTasks />
                    </div>
                </div>

                {/* Time Tracker Section */}
                <TimeTracker />

                {/* Projects and Messages */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
                    {/* Projects Section */}
                    <div className="col-span-1 lg:col-span-2">
                        <ProjectsSection />
                    </div>

                    {/* Messages */}
                    <div className="col-span-1 lg:col-span-1">
                        <MessagesSection />
                    </div>
                </div>

                {/* My Tasks and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* My Tasks */}
                    <div className="col-span-1 lg:col-span-2">
                        <MyTasks />
                    </div>

                    {/* Recent Activity */}
                    <div className="col-span-1 lg:col-span-1">
                        <RecentActivity />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;