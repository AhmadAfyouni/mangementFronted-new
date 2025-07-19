import { AlertCircle, FileText, Type } from "lucide-react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { TaskFormInputs } from "@/types/Task.type";
import { useTasksGuard } from "@/hooks/tasks/useTaskFieldSettings";

interface BasicInformationSectionProps {
    register: UseFormRegister<TaskFormInputs>;
    errors: FieldErrors<TaskFormInputs>;
    t: (key: string) => string;
}

const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
    register,
    errors,
    t,
}) => {
    const showPriority = useTasksGuard(["enablePriority"]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Name */}
            <div className="md:col-span-1">
                <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Type className="w-4 h-4 text-purple-400" />
                    {t("Task Name")} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                    <input
                        {...register("name")}
                        type="text"
                        placeholder={t("Enter task name")}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors"
                    />
                    {errors.name && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    )}
                </div>
                {errors.name && (
                    <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Priority */}
            {showPriority && (
                <div className="md:col-span-1">
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-purple-400" />
                        {t("Priority")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <select
                            {...register("priority")}
                            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-orange-500 focus:ring focus:ring-orange-500/20 focus:outline-none transition-colors appearance-none"
                        >
                            <option value="">{t("Select Priority")}</option>
                            <option value="LOW">{t("Low")}</option>
                            <option value="MEDIUM">{t("Medium")}</option>
                            <option value="HIGH">{t("High")}</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    {errors.priority && (
                        <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.priority.message}
                        </p>
                    )}
                </div>
            )}

            {/* Description */}
            <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    {t("Description")} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                    <textarea
                        {...register("description")}
                        placeholder={t("Enter task description")}
                        rows={4}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors resize-none"
                    />
                    {errors.description && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    )}
                </div>
                {errors.description && (
                    <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.description.message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default BasicInformationSection; 