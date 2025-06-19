import { useMokkBar } from '@/components/Providers/Mokkbar';
import { updateProjectStatus } from '@/services/project.service';
import { ProjectStatus } from '@/types/Project.type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Clock, Loader2, Play, TrendingUp, Trophy, RotateCcw } from 'lucide-react';
import React from 'react';

interface ProjectStatusControlsProps {
    projectId: string;
    currentStatus?: ProjectStatus;
    onStatusUpdated: (newStatus: ProjectStatus) => void;
    t: (key: string) => string;
}

const ProjectStatusControls: React.FC<ProjectStatusControlsProps> = ({
    projectId,
    currentStatus,
    onStatusUpdated,
    t
}) => {
    const queryClient = useQueryClient();
    const { setSnackbarConfig } = useMokkBar()

    // Use mutation for status update
    const { mutate, isPending } = useMutation({
        mutationFn: ({ status }: { status: ProjectStatus }) =>
            updateProjectStatus(projectId, status),
        onSuccess: (data) => {
            if (data.status) {
                onStatusUpdated(data.status);
                queryClient.invalidateQueries({ queryKey: ["project-details"] });
                queryClient.invalidateQueries({ queryKey: ["project-details", data._id] });
            }
        },
        onError: (error) => {
            console.error("Error updating project status:", error);

            setSnackbarConfig({
                open: true,
                message: t("Failed to update project status"),
                severity: "warning"
            })
        }
    });

    // Helper function to check if a status is active based on the API values
    const isStatusActive = (status: ProjectStatus): boolean => {
        // Handle the case where the API returns uppercase with underscores
        if (currentStatus === 'IN_PROGRESS' && status === ProjectStatus.IN_PROGRESS) return true;
        if (currentStatus === 'PENDING' && status === ProjectStatus.PENDING) return true;
        if (currentStatus === 'COMPLETED' && status === ProjectStatus.COMPLETED) return true;

        return currentStatus === status;
    };

    const handleUpdateStatus = (status: ProjectStatus) => {
        if (isStatusActive(status) || isPending) return;
        mutate({ status });
    };

    // Get status configuration
    const getStatusConfig = (status: ProjectStatus) => {
        const configs = {
            [ProjectStatus.PENDING]: {
                icon: Clock,
                color: 'text-warning',
                bgColor: 'bg-warning/10',
                borderColor: 'border-warning/30',
                label: t("Pending"),
                description: t("Project is awaiting approval to start")
            },
            [ProjectStatus.IN_PROGRESS]: {
                icon: TrendingUp,
                color: 'text-primary',
                bgColor: 'bg-primary/10',
                borderColor: 'border-primary/30',
                label: t("In Progress"),
                description: t("Project is actively being worked on")
            },
            [ProjectStatus.COMPLETED]: {
                icon: Trophy,
                color: 'text-success',
                bgColor: 'bg-success/10',
                borderColor: 'border-success/30',
                label: t("Completed"),
                description: t("Project has been successfully completed")
            }
        };
        return configs[status];
    };

    return (
        <div className="bg-dark rounded-2xl p-6 border border-gray-700/50 shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                    <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-twhite">{t("Project Status")}</h3>
                    <p className="text-sm text-tdark">{t("Manage your project lifecycle")}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                {isPending ? (
                    <div className="flex items-center justify-center p-4 bg-secondary/50 rounded-xl border border-gray-700/30">
                        <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                        <span className="text-twhite font-medium">{t("Updating status...")}</span>
                    </div>
                ) : (
                    <>
                        {/* PENDING Status - Show Start Project button */}
                        {isStatusActive(ProjectStatus.PENDING) && (
                            <button
                                onClick={() => handleUpdateStatus(ProjectStatus.IN_PROGRESS)}
                                className="w-full bg-primary hover:bg-primary/80 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                disabled={isPending}
                            >
                                <Play className="w-4 h-4" />
                                {t("Start Project")}
                            </button>
                        )}

                        {/* IN_PROGRESS Status - Show Back to Pending and Mark as Completed buttons */}
                        {isStatusActive(ProjectStatus.IN_PROGRESS) && (
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleUpdateStatus(ProjectStatus.PENDING)}
                                    className="bg-warning hover:bg-warning/80 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
                                    disabled={isPending}
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span className="text-sm">{t("Back to Pending")}</span>
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(ProjectStatus.COMPLETED)}
                                    className="bg-success hover:bg-success/80 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
                                    disabled={isPending}
                                >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span className="text-sm">{t("Mark as Completed")}</span>
                                </button>
                            </div>
                        )}

                        {/* COMPLETED Status - Show Back to In Progress button */}
                        {isStatusActive(ProjectStatus.COMPLETED) && (
                            <div className="space-y-3">
                                {/* Back to In Progress button */}
                                <button
                                    onClick={() => handleUpdateStatus(ProjectStatus.IN_PROGRESS)}
                                    className="w-full bg-primary hover:bg-primary/80 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                    disabled={isPending}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    {t("Back to In Progress")}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Status Timeline */}
            <div className="mt-6 pt-4 border-t border-gray-700/50">
                <h4 className="text-sm font-medium text-tdark mb-3">{t("Project Timeline")}</h4>
                <div className="flex items-center justify-between">
                    {Object.values(ProjectStatus).map((status, index) => {
                        const config = getStatusConfig(status);
                        const isActive = isStatusActive(status);
                        const isPassed = currentStatus === ProjectStatus.IN_PROGRESS && status === ProjectStatus.PENDING ||
                            currentStatus === ProjectStatus.COMPLETED && (status === ProjectStatus.PENDING || status === ProjectStatus.IN_PROGRESS);

                        return (
                            <React.Fragment key={status}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                                        ? `${config.bgColor} ${config.borderColor} ${config.color}`
                                        : isPassed
                                            ? 'bg-success/20 border-success/50 text-success'
                                            : 'bg-secondary/50 border-gray-600 text-tdark'
                                        }`}>
                                        <config.icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-xs mt-1 font-medium ${isActive ? config.color : isPassed ? 'text-success' : 'text-tdark'
                                        }`}>
                                        {config.label}
                                    </span>
                                </div>
                                {index < Object.values(ProjectStatus).length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${isPassed ? 'bg-success/50' : 'bg-gray-700/50'
                                        }`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProjectStatusControls;