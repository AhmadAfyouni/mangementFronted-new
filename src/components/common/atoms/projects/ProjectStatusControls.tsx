import React from 'react';
import { ProjectStatus } from '@/types/Project.type';
import { updateProjectStatus } from '@/services/project.service';
import { CheckCircle, Play, Loader2 } from 'lucide-react';
import useCustomTheme from '@/hooks/useCustomTheme';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
    const { isLightMode } = useCustomTheme();
    const queryClient = useQueryClient()
    // Use mutation for status update
    const { mutate, isPending } = useMutation({
        mutationFn: ({ status }: { status: ProjectStatus }) =>
            updateProjectStatus(projectId, status),
        onSuccess: (data) => {
            if (data.status) {
                onStatusUpdated(data.status);
                queryClient.invalidateQueries({ queryKey: ["project-details"] })
            }
        },
        onError: (error) => {
            console.error("Error updating project status:", error);
            alert(t("Failed to update project status"));
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

    // If status is COMPLETED, don't show any buttons
    if (isStatusActive(ProjectStatus.COMPLETED)) {
        return (
            <div className={`rounded-xl p-4 ${isLightMode ? 'bg-gray-100' : 'bg-dark'} border ${isLightMode ? 'border-gray-200' : 'border-gray-700'} shadow-md`}>
                <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-500" />
                    <h3 className={`text-lg font-semibold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                        {t("Project Completed")}
                    </h3>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-xl p-4 ${isLightMode ? 'bg-gray-100' : 'bg-dark'} border ${isLightMode ? 'border-gray-200' : 'border-gray-700'} shadow-md`}>
            <h3 className={`text-lg font-semibold mb-3 ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                {t("Project Status")}
            </h3>

            <div className="flex flex-wrap gap-2">
                {isPending ? (
                    <div className="px-4 py-2 rounded-md bg-gray-700 text-white flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        {t("Updating status...")}
                    </div>
                ) : (
                    <>
                        {/* Show In Progress button only when status is PENDING */}
                        {isStatusActive(ProjectStatus.PENDING) && (
                            <button
                                onClick={() => handleUpdateStatus(ProjectStatus.IN_PROGRESS)}
                                className="px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors bg-blue-600 text-white hover:bg-blue-700"
                                disabled={isPending}
                            >
                                <Play size={18} />
                                {t("Move to In Progress")}
                            </button>
                        )}

                        {/* Show Completed button only when status is IN_PROGRESS */}
                        {isStatusActive(ProjectStatus.IN_PROGRESS) && (
                            <button
                                onClick={() => handleUpdateStatus(ProjectStatus.COMPLETED)}
                                className="px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors bg-green-600 text-white hover:bg-green-700"
                                disabled={isPending}
                            >
                                <CheckCircle size={18} />
                                {t("Mark as Completed")}
                            </button>
                        )}
                    </>
                )}
            </div>

            <div className="mt-3 text-sm flex items-center gap-2">
                <span className="text-gray-400">{t("Current Status")}:</span>
                <span className={`font-medium px-2 py-1 rounded-full text-xs ${isStatusActive(ProjectStatus.PENDING)
                    ? 'bg-orange-500/20 text-orange-300'
                    : isStatusActive(ProjectStatus.IN_PROGRESS)
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                    {isStatusActive(ProjectStatus.PENDING) && t("Pending")}
                    {isStatusActive(ProjectStatus.IN_PROGRESS) && t("In Progress")}
                    {isStatusActive(ProjectStatus.COMPLETED) && t("Completed")}
                </span>
            </div>
        </div>
    );
};

export default ProjectStatusControls; 