import { AlertCircle, Calendar, Clock, Repeat, RotateCcw } from "lucide-react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { TaskFormInputs } from "@/types/Task.type";
import { useRef } from "react";

interface RecurringRoutineSectionProps {
    register: UseFormRegister<TaskFormInputs>;
    errors: FieldErrors<TaskFormInputs>;
    t: (key: string) => string;
    isRecurring: boolean | undefined;
    dateConstraints?: { min: string | undefined; max: string | undefined };
}

const RecurringRoutineSection: React.FC<RecurringRoutineSectionProps> = ({
    register,
    errors,
    t,
    isRecurring,
    dateConstraints
}) => {
    const recurringEndDateRef = useRef<HTMLInputElement | null>(null);
    const endDateRef = useRef<HTMLInputElement | null>(null);

    return (
        <div className="space-y-6">
            {/* Is Recurring */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-lg border border-purple-500/20">
                    <input
                        {...register("isRecurring")}
                        type="checkbox"
                        id="isRecurring"
                        className="w-5 h-5 text-purple-600 bg-dark border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="isRecurring" className="text-twhite font-medium flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-purple-400" />
                        {t("Recurring Task")}
                    </label>
                </div>

                {isRecurring && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5 bg-gradient-to-br from-dark to-gray-800/50 rounded-xl border border-purple-500/30">
                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <RotateCcw className="w-4 h-4 text-orange-400" />
                                {t("Recurring Type")} {isRecurring && <span className="text-red-400">*</span>}
                            </label>
                            <div className="relative">
                                <select
                                    {...register("recurringType")}
                                    className="w-full px-4 py-3 rounded-lg bg-darker text-twhite border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors appearance-none"
                                >
                                    <option value="">{t("Select Type")}</option>
                                    <option value="daily">{t("Daily")}</option>
                                    <option value="weekly">{t("Weekly")}</option>
                                    <option value="monthly">{t("Monthly")}</option>
                                    <option value="yearly">{t("Yearly")}</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            {errors.recurringType && (
                                <p className="text-red-400 mt-1.5 text-xs flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.recurringType.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-400" />
                                {t("Interval (Days)")} {isRecurring && <span className="text-red-400">*</span>}
                            </label>
                            <input
                                {...register("intervalInDays")}
                                type="number"
                                min="1"
                                placeholder={t("Enter interval")}
                                className="w-full px-4 py-3 rounded-lg bg-darker text-twhite border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors"
                            />
                            {errors.intervalInDays && (
                                <p className="text-red-400 mt-1.5 text-xs flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.intervalInDays.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-orange-400" />
                                {t("Recurring End Date")} {isRecurring && <span className="text-red-400">*</span>}
                            </label>
                            <div className="relative">
                                <input
                                    {...register("recurringEndDate")}
                                    ref={e => {
                                        register("recurringEndDate").ref(e);
                                        recurringEndDateRef.current = e;
                                    }}
                                    type="date"
                                    min={dateConstraints?.min}
                                    max={dateConstraints?.max}
                                    className="w-full px-4 py-3 rounded-lg bg-darker text-twhite border border-gray-600 focus:border-green-500 focus:ring focus:ring-green-500/20 focus:outline-none transition-colors cursor-pointer"
                                />
                                <div
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    onClick={() => recurringEndDateRef.current?.showPicker?.() || recurringEndDateRef.current?.focus()}
                                    style={{ pointerEvents: 'auto' }}
                                >
                                </div>
                            </div>
                            {errors.recurringEndDate && (
                                <p className="text-red-400 mt-1.5 text-xs flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.recurringEndDate.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-yellow-400" />
                                {t("End Date")} <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    {...register("end_date")}
                                    ref={e => {
                                        register("end_date").ref(e);
                                        endDateRef.current = e;
                                    }}
                                    type="date"
                                    min={dateConstraints?.min}
                                    max={dateConstraints?.max}
                                    className="w-full px-4 py-3 rounded-lg bg-darker text-twhite border border-gray-600 focus:border-yellow-500 focus:ring focus:ring-yellow-500/20 focus:outline-none transition-colors cursor-pointer"
                                />
                            </div>
                            {errors.end_date && (
                                <p className="text-red-400 mt-1.5 text-xs flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.end_date.message}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Is Routine Task */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-600/10 to-cyan-600/10 rounded-lg border border-indigo-500/20">
                    <input
                        {...register("isRoutineTask")}
                        type="checkbox"
                        id="isRoutineTask"
                        className="w-5 h-5 text-indigo-600 bg-dark border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                    />
                    <label htmlFor="isRoutineTask" className="text-twhite font-medium flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-indigo-400" />
                        {t("Routine Task")}
                    </label>
                </div>
            </div>
        </div>
    );
};

export default RecurringRoutineSection; 