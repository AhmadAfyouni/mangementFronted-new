import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { addTitleSchema } from '@/schemas/job.schema';
import { JobTitleFormInputs, JobTitleType } from '@/types/JobTitle.type';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/utils/axios/usage';
import { Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const useJobTitleForm = () => {
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [jobTitleData, setJobTitleData] = useState<JobTitleType | null>(null);
    const { t } = useTranslation();

    // Default values for a job title form
    const defaultValues: JobTitleFormInputs = {
        title: "",
        description: "",
        responsibilities: [],
        permissions: [],
        department_id: "",
        category: "",
        is_manager: false,
        accessibleDepartments: [],
        accessibleEmps: [],
        accessibleJobTitles: [],
        routineTasks: [],
        hasRoutineTasks: false,
        autoGenerateRoutineTasks: true,
    };

    // Initialize form with react-hook-form
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        control,
        getValues,
        setValue,
        watch,
    } = useForm<JobTitleFormInputs>({
        // Use type assertion to handle complex schema-form mapping
        resolver: yupResolver(addTitleSchema) as Resolver<JobTitleFormInputs>,
        defaultValues,
    });

    // Add job title mutation
    const { mutate, isError, error, isPending } = useMutation({
        mutationFn: async (data: JobTitleFormInputs) => {
            setIsLoading(true);
            try {
                const response = await apiClient.post<{ data: JobTitleType }>('/job-titles', data);
                setFeedbackMessage(t("Job title created successfully"));
                return response.data;
            } catch (error) {
                setFeedbackMessage(t("Error creating job title"));
                throw error;
            } finally {
                setIsLoading(false);
            }
        }
    });

    // Check if there's session storage data to populate the form
    useEffect(() => {
        try {
            // Extract the page data key from URL params
            const params = new URLSearchParams(window.location.search);
            const pageDataKey = params.get('pageData');

            if (pageDataKey) {
                // Try to get the data from session storage
                const storedData = sessionStorage.getItem(pageDataKey);

                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    setJobTitleData(parsedData);

                    // Map the stored data to form fields
                    const formData: JobTitleFormInputs = {
                        id: parsedData.id,
                        title: parsedData.title || "",
                        description: parsedData.description || "",
                        responsibilities: parsedData.responsibilities || [],
                        permissions: parsedData.permissions || [],
                        department_id: parsedData.department?.id || "",
                        category: parsedData.category?.id || "",
                        is_manager: parsedData.is_manager || false,
                        accessibleDepartments: parsedData.accessibleDepartments || [],
                        accessibleEmps: parsedData.accessibleEmps || [],
                        accessibleJobTitles: parsedData.accessibleJobTitles || [],
                        hasRoutineTasks: parsedData.hasRoutineTasks || false,
                        autoGenerateRoutineTasks: parsedData.autoGenerateRoutineTasks || false,
                        routineTasks: (parsedData.routineTasks || []).map((task: {
                            name?: string;
                            description?: string;
                            priority?: string;
                            recurringType?: string;
                            intervalDays?: number;
                            estimatedHours?: number;
                            isActive?: boolean;
                            instructions?: string[];
                            hasSubTasks?: boolean;
                            subTasks?: {
                                name?: string;
                                description?: string;
                                estimatedHours?: number;
                            }[];
                        }) => ({
                            name: task.name || "",
                            description: task.description || "",
                            priority: task.priority || "MEDIUM",
                            recurringType: task.recurringType || "WEEKLY",
                            intervalDays: task.intervalDays || 7,
                            estimatedHours: task.estimatedHours || 1,
                            isActive: task.isActive !== undefined ? task.isActive : true,
                            instructions: task.instructions || [],
                            hasSubTasks: task.hasSubTasks || false,
                            subTasks: (task.subTasks || []).map((subtask: {
                                name?: string;
                                description?: string;
                                estimatedHours?: number;
                            }) => ({
                                name: subtask.name || "",
                                description: subtask.description || "",
                                estimatedHours: subtask.estimatedHours || 0
                            }))
                        }))
                    };

                    // Reset the form with the retrieved data
                    reset(formData);

                    // Clean up session storage
                    sessionStorage.removeItem(pageDataKey);
                }
            }
        } catch (error) {
            console.error("Error retrieving form data from session storage:", error);
        }
    }, [reset]);

    return {
        formMethods: {
            register,
            handleSubmit,
            errors,
            reset,
            control,
            getValues,
            setValue,
            watch,
        },
        feedbackMessage,
        setFeedbackMessage,
        isPendingJobTitle: isPending || isLoading,
        addJobTitle: mutate,
        isErrorJobTitle: isError,
        errorJobTitle: error,
        jobTitleData,
    };
}; 