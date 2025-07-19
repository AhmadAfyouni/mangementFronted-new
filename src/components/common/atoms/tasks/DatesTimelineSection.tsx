import { AlertCircle, BarChart3, Calendar, FolderOpen } from "lucide-react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { TaskFormInputs } from "@/types/Task.type";
import { ProjectType } from "@/types/Project.type";
import { apiClient } from "@/utils/axios/usage";
import { useEffect, useRef, useState } from "react";
import { useTasksGuard } from "@/hooks/tasks/useTaskFieldSettings";

interface DatesTimelineSectionProps {
    register: UseFormRegister<TaskFormInputs>;
    errors: FieldErrors<TaskFormInputs>;
    t: (key: string) => string;
    dateConstraints: { min: string | undefined; max: string | undefined };
    selectedProjectData: ProjectType | null | undefined;
    watch: any;
    setValue: any;
}

const DatesTimelineSection: React.FC<DatesTimelineSectionProps> = ({
    register,
    errors,
    t,
    dateConstraints,
    selectedProjectData,
    watch,
    setValue,
}) => {
    const [isExpectedEndDisabled, setIsExpectedEndDisabled] = useState(false);
    const expectedEndWasSetByUser = useRef(false);
    const [estimatedHours, setEstimatedHours] = useState<number | null>(null);
    const [estimatedWorkingDays, setEstimatedWorkingDays] = useState<number | null>(null);

    const startDate = watch("start_date");
    const dueDate = watch("due_date");

    // Auto-fetch expected end date when both start and due date are set
    useEffect(() => {
        if (startDate && dueDate) {
            setIsExpectedEndDisabled(true);
            apiClient
                .get<{ data: { estimatedHours: number; workingDays: number; startDate: string; endDate: string } }>(
                    "/company-settings/calculate-working-days",
                    { startDate, endDate: dueDate }
                )
                .then((res) => {
                    if (res.data && res.data.endDate) {
                        setValue("expected_end_date", res.data.endDate.split("T")[0]);
                        setEstimatedHours(res.data.estimatedHours);
                        setEstimatedWorkingDays(res.data.workingDays);
                        expectedEndWasSetByUser.current = false;
                    }
                })
                .catch(() => {
                    setIsExpectedEndDisabled(false);
                    setEstimatedHours(null);
                    setEstimatedWorkingDays(null);
                })
        } else {
            setIsExpectedEndDisabled(false);
            setEstimatedHours(null);
            setEstimatedWorkingDays(null);
            if (!expectedEndWasSetByUser.current) {
                setValue("expected_end_date", "");
            }
        }
    }, [startDate, dueDate, setValue]);

    // Track if user sets expected_end_date manually
    useEffect(() => {
        const subscription = watch((values: any, { name }: any) => {
            if (name === "expected_end_date" && !isExpectedEndDisabled) {
                expectedEndWasSetByUser.current = true;
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, isExpectedEndDisabled]);

    const startDateRef = useRef<HTMLInputElement | null>(null);
    const dueDateRef = useRef<HTMLInputElement | null>(null);

    // Enhanced date picker opening function
    const openDatePicker = (inputRef: React.RefObject<HTMLInputElement>) => {
        try {
            if ('showPicker' in (inputRef.current || {})) {
                (inputRef.current as any)?.showPicker();
            } else {
                inputRef.current?.focus();
                inputRef.current?.click();
            }
        } catch (error) {
            console.log(error);
            inputRef.current?.focus();
        }
    };

    const showEstimatedTime = useTasksGuard(["enableEstimatedTime"]);
    const showDueDate = useTasksGuard(["enableDueDate"]);

    return (
        <div className="space-y-4">
            {/* Project Date Info Display */}
            {selectedProjectData && (
                <div className="p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
                        <FolderOpen className="w-4 h-4" />
                        {t("Project Date Constraints")}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="w-3 h-3 text-green-400" />
                            <span>{t("Project Start")}: </span>
                            <span className="text-green-400 font-medium">
                                {selectedProjectData.startDate ? new Date(selectedProjectData.startDate).toLocaleDateString() : t("Not set")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="w-3 h-3 text-red-400" />
                            <span>{t("Project End")}: </span>
                            <span className="text-red-400 font-medium">
                                {selectedProjectData.endDate ? new Date(selectedProjectData.endDate).toLocaleDateString() : t("Not set")}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-400" />
                        {t("Start Date")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <div
                            className="relative cursor-pointer"
                            onClick={() => openDatePicker(startDateRef)}
                        >
                            <input
                                {...register("start_date")}
                                ref={e => {
                                    register("start_date").ref(e);
                                    startDateRef.current = e;
                                }}
                                type="date"
                                min={dateConstraints.min}
                                max={dateConstraints.max}
                                className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-green-500 focus:ring focus:ring-green-500/20 focus:outline-none transition-colors cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openDatePicker(startDateRef);
                                }}
                            />
                            {/* Overlay to make entire area clickable */}
                            <div className="absolute inset-0 cursor-pointer" />
                        </div>
                    </div>
                    {errors.start_date && (
                        <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.start_date.message}
                        </p>
                    )}
                    {dateConstraints.min && (
                        <p className="text-green-400 mt-1 text-xs">
                            {t("Must be between")} {new Date(dateConstraints.min).toLocaleDateString()} - {dateConstraints.max ? new Date(dateConstraints.max).toLocaleDateString() : t("Project end")}
                        </p>
                    )}
                </div>

                {/* Due Date */}
                {showDueDate && (
                    <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-red-400" />
                            {t("Due Date")} <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <div
                                className="relative cursor-pointer"
                                onClick={() => openDatePicker(dueDateRef)}
                            >
                                <input
                                    {...register("due_date")}
                                    ref={e => {
                                        register("due_date").ref(e);
                                        dueDateRef.current = e;
                                    }}
                                    type="date"
                                    min={dateConstraints.min}
                                    max={dateConstraints.max}
                                    className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-red-500 focus:ring focus:ring-red-500/20 focus:outline-none transition-colors cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDatePicker(dueDateRef);
                                    }}
                                />
                                {/* Overlay to make entire area clickable */}
                                <div className="absolute inset-0 cursor-pointer" />
                            </div>
                        </div>
                        {errors.due_date && (
                            <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.due_date.message}
                            </p>
                        )}
                        {dateConstraints.min && (
                            <p className="text-red-400 mt-1 text-xs">
                                {t("Must be between")} {new Date(dateConstraints.min).toLocaleDateString()} - {dateConstraints.max ? new Date(dateConstraints.max).toLocaleDateString() : t("Project end")}
                            </p>
                        )}
                    </div>
                )}

                {/* Estimated Working Hours and Days */}
                {showEstimatedTime && isExpectedEndDisabled && estimatedHours !== null && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-400" />
                                {t("Estimated Working Hours")}
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors"
                                value={Math.round(estimatedHours)}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setEstimatedHours(value);
                                }}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-400" />
                                {t("Estimated Working Days")}
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors"
                                value={estimatedWorkingDays !== null ? estimatedWorkingDays : ''}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setEstimatedWorkingDays(value);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Progress Calculation Method */}
                <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        {t("Progress Calculation")}
                    </label>
                    <div className="relative">
                        <select
                            {...register("progressCalculationMethod")}
                            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors appearance-none cursor-pointer"
                        >
                            <option value="">
                                {t("Select a calculation method")}
                            </option>
                            <option value="time_based">
                                {t("Time Based")}
                            </option>
                            <option value="date_based">
                                {t("Date Based")}
                            </option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatesTimelineSection; 