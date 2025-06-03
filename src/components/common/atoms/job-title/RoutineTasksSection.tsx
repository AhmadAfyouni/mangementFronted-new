import React, { useState } from "react";
import { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import { CreateRoutineTaskDto, JobTitleFormInputs, PriorityLevel, RecurringType } from "@/types/JobTitle.type";
import useCustomTheme from "@/hooks/useCustomTheme";
import { Trash, Plus, MinusCircle, ChevronDown, ChevronUp, Edit } from "lucide-react";
import { PRIORITY_LEVELS, RECURRING_TYPES } from "@/schemas/job.schema";

interface RoutineTasksSectionProps {
    hasRoutineTasks: boolean;
    setHasRoutineTasks: (value: boolean) => void;
    autoGenerateRoutineTasks: boolean;
    setAutoGenerateRoutineTasks: (value: boolean) => void;
    routineTasks: CreateRoutineTaskDto[];
    setRoutineTasks: (tasks: CreateRoutineTaskDto[]) => void;
    register: UseFormRegister<JobTitleFormInputs>;
    setValue: UseFormSetValue<JobTitleFormInputs>;
    errors: FieldErrors<JobTitleFormInputs>;
    t: (key: string) => string;
}

const RoutineTasksSection: React.FC<RoutineTasksSectionProps> = ({
    hasRoutineTasks,
    setHasRoutineTasks,
    autoGenerateRoutineTasks,
    setAutoGenerateRoutineTasks,
    routineTasks,
    setRoutineTasks,
    register,
    setValue,
    errors,
    t,
}) => {
    const { isLightMode } = useCustomTheme();
    const [newTask, setNewTask] = useState<CreateRoutineTaskDto>({
        name: "",
        description: "",
        priority: "medium",
        recurringType: "weekly",
        intervalDays: 7,
        estimatedHours: 1,
        isActive: true,
        instructions: [],
        hasSubTasks: false,
        subTasks: [],
    });

    const [showAddTaskForm, setShowAddTaskForm] = useState(true);
    const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);

    const [newInstruction, setNewInstruction] = useState("");
    const [newSubTask, setNewSubTask] = useState({
        name: "",
        description: "",
        estimatedHours: 0
    });

    const handleAddTask = () => {
        if (newTask.name.trim() === "" || newTask.description.trim() === "") {
            return;
        }

        let updatedTasks = [...routineTasks];

        if (editingTaskIndex !== null) {
            // Update existing task
            updatedTasks[editingTaskIndex] = { ...newTask };
        } else {
            // Add new task
            updatedTasks = [...routineTasks, { ...newTask }];
        }

        setRoutineTasks(updatedTasks);
        setValue("routineTasks", updatedTasks);

        // Reset the form
        setNewTask({
            name: "",
            description: "",
            priority: "medium",
            recurringType: "weekly",
            intervalDays: 7,
            estimatedHours: 1,
            isActive: true,
            instructions: [],
            hasSubTasks: false,
            subTasks: [],
        });
        setNewInstruction("");
        setNewSubTask({
            name: "",
            description: "",
            estimatedHours: 0
        });
        setEditingTaskIndex(null);

        // Auto-collapse the form after adding a task
        setShowAddTaskForm(false);
    };

    const handleEditTask = (index: number) => {
        const taskToEdit = routineTasks[index];
        setNewTask({ ...taskToEdit });
        setEditingTaskIndex(index);
        setShowAddTaskForm(true);
    };

    const handleCancelEdit = () => {
        setNewTask({
            name: "",
            description: "",
            priority: "medium",
            recurringType: "weekly",
            intervalDays: 7,
            estimatedHours: 1,
            isActive: true,
            instructions: [],
            hasSubTasks: false,
            subTasks: [],
        });
        setEditingTaskIndex(null);
    };

    const handleRemoveTask = (index: number) => {
        const updatedTasks = routineTasks.filter((_, i) => i !== index);
        setRoutineTasks(updatedTasks);
        setValue("routineTasks", updatedTasks);

        // If currently editing this task, cancel the edit
        if (editingTaskIndex === index) {
            handleCancelEdit();
        } else if (editingTaskIndex !== null && editingTaskIndex > index) {
            // Adjust editing index if we're removing a task before the one being edited
            setEditingTaskIndex(editingTaskIndex - 1);
        }
    };

    const handleTaskInputChange = (
        field: keyof CreateRoutineTaskDto,
        value: string | number | boolean
    ) => {
        setNewTask({
            ...newTask,
            [field]: field === "intervalDays" || field === "estimatedHours" ? Number(value) : value,
        });
    };

    const handleAddInstruction = () => {
        if (newInstruction.trim() === "") return;

        const updatedInstructions = [...(newTask.instructions || []), newInstruction];
        setNewTask({
            ...newTask,
            instructions: updatedInstructions
        });
        setNewInstruction("");
    };

    const handleRemoveInstruction = (index: number) => {
        const updatedInstructions = newTask.instructions?.filter((_, i) => i !== index) || [];
        setNewTask({
            ...newTask,
            instructions: updatedInstructions
        });
    };

    const handleAddSubTask = () => {
        if (newSubTask.name.trim() === "") return;

        const updatedSubTasks = [...(newTask.subTasks || []), { ...newSubTask }];
        setNewTask({
            ...newTask,
            subTasks: updatedSubTasks,
            hasSubTasks: true
        });
        setNewSubTask({
            name: "",
            description: "",
            estimatedHours: 0
        });
    };

    const handleRemoveSubTask = (index: number) => {
        const updatedSubTasks = newTask.subTasks?.filter((_, i) => i !== index) || [];
        setNewTask({
            ...newTask,
            subTasks: updatedSubTasks,
            hasSubTasks: updatedSubTasks.length > 0
        });
    };

    const handleSubTaskInputChange = (
        field: keyof typeof newSubTask,
        value: string | number
    ) => {
        setNewSubTask({
            ...newSubTask,
            [field]: field === "estimatedHours" ? Number(value) : value
        });
    };

    const toggleAddTaskForm = () => {
        setShowAddTaskForm(!showAddTaskForm);
        if (!showAddTaskForm && editingTaskIndex !== null) {
            handleCancelEdit();
        }
    };

    // Helper function to capitalize first letter for display
    const capitalize = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <div className="mb-6">
            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="hasRoutineTasks"
                    checked={hasRoutineTasks}
                    onChange={(e) => {
                        setHasRoutineTasks(e.target.checked);
                        setValue("hasRoutineTasks", e.target.checked);
                    }}
                    className="mr-2 cursor-pointer"
                />
                <label htmlFor="hasRoutineTasks" className="text-tmid cursor-pointer">
                    {t("Has Routine Tasks")}
                </label>
            </div>

            {hasRoutineTasks && (
                <>
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            id="autoGenerateRoutineTasks"
                            checked={autoGenerateRoutineTasks}
                            onChange={(e) => {
                                setAutoGenerateRoutineTasks(e.target.checked);
                                setValue("autoGenerateRoutineTasks", e.target.checked);
                            }}
                            className="mr-2 cursor-pointer"
                        />
                        <label
                            htmlFor="autoGenerateRoutineTasks"
                            className="text-tmid cursor-pointer"
                        >
                            {t("Auto Generate Routine Tasks")}
                        </label>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-tmid font-semibold mb-3">
                            {t("Routine Tasks")}
                        </h3>

                        {/* List of existing routine tasks */}
                        {routineTasks.length > 0 && (
                            <div className="mb-4 bg-secondary/30 p-4 rounded-lg">
                                <h4 className="text-sm font-medium mb-2">
                                    {t("Current Routine Tasks")}
                                </h4>
                                <div className="space-y-3">
                                    {routineTasks.map((task, index) => (
                                        <div
                                            key={index}
                                            className={`${isLightMode ? "bg-dark" : "bg-secondary"
                                                } p-3 rounded-lg flex justify-between items-start ${editingTaskIndex === index ? 'border-2 border-blue-500' : ''}`}
                                        >
                                            <div>
                                                <h5 className="font-medium">{task.name}</h5>
                                                <p className="text-sm text-gray-300">
                                                    {task.description}
                                                </p>
                                                <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-400">
                                                    <span>
                                                        {t("Priority")}: {capitalize(task.priority || '')}
                                                    </span>
                                                    <span>
                                                        {t("Type")}: {capitalize(task.recurringType || '')}
                                                    </span>
                                                    <span>
                                                        {t("Interval")}: {task.intervalDays} {t("days")}
                                                    </span>
                                                    <span>
                                                        {t("Est. Hours")}: {task.estimatedHours}
                                                    </span>
                                                    <span>
                                                        {task.isActive ? t("Active") : t("Inactive")}
                                                    </span>
                                                </div>

                                                {task.instructions && task.instructions.length > 0 && (
                                                    <div className="mt-2">
                                                        <h6 className="text-xs font-medium">{t("Instructions")}:</h6>
                                                        <ul className="list-disc pl-4 text-xs text-gray-300">
                                                            {task.instructions.map((instruction, i) => (
                                                                <li key={i}>{instruction}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {task.hasSubTasks && task.subTasks && task.subTasks.length > 0 && (
                                                    <div className="mt-2">
                                                        <h6 className="text-xs font-medium">{t("Subtasks")}:</h6>
                                                        <div className="pl-2 space-y-1 mt-1">
                                                            {task.subTasks.map((subtask, i) => (
                                                                <div key={i} className="text-xs border-l border-gray-700 pl-2">
                                                                    <div className="font-medium">{subtask.name}</div>
                                                                    <div className="text-gray-400">{subtask.description}</div>
                                                                    <div className="text-gray-500">{t("Est.")}: {subtask.estimatedHours}h</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditTask(index)}
                                                    className="text-blue-400 hover:text-blue-500"
                                                    title={t("Edit Task")}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTask(index)}
                                                    className="text-red-400 hover:text-red-500"
                                                    title={t("Delete Task")}
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Toggle button for Add New Task form */}
                        <div className="mb-3">
                            <button
                                type="button"
                                onClick={toggleAddTaskForm}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isLightMode ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-700 hover:bg-gray-600"
                                    } transition-colors`}
                            >
                                {showAddTaskForm ? (
                                    <>
                                        <ChevronUp size={18} />
                                        {editingTaskIndex !== null ? t("Hide Edit Task Form") : t("Hide Add Task Form")}
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={18} />
                                        {t("Show Add Task Form")}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Form to add a new routine task */}
                        {showAddTaskForm && (
                            <div className="border border-gray-700 rounded-lg p-4">
                                <h4 className="text-sm font-medium mb-3">
                                    {editingTaskIndex !== null ? t("Edit Routine Task") : t("Add New Routine Task")}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-tmid text-sm mb-1">
                                            {t("Task Name")}
                                        </label>
                                        <input
                                            type="text"
                                            value={newTask.name}
                                            onChange={(e) =>
                                                handleTaskInputChange("name", e.target.value)
                                            }
                                            className={`${isLightMode ? "bg-dark" : "bg-secondary"
                                                } border-none outline-none w-full px-4 py-2 rounded-lg`}
                                            placeholder={t("Enter task name")}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-tmid text-sm mb-1">
                                            {t("Description")}
                                        </label>
                                        <input
                                            type="text"
                                            value={newTask.description}
                                            onChange={(e) =>
                                                handleTaskInputChange("description", e.target.value)
                                            }
                                            className={`${isLightMode ? "bg-dark" : "bg-secondary"
                                                } border-none outline-none w-full px-4 py-2 rounded-lg`}
                                            placeholder={t("Enter description")}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-tmid text-sm mb-1">
                                            {t("Priority")}
                                        </label>
                                        <select
                                            value={newTask.priority}
                                            onChange={(e) =>
                                                handleTaskInputChange("priority", e.target.value)
                                            }
                                            className={`${isLightMode ? "bg-dark" : "bg-secondary"
                                                } border-none outline-none w-full px-4 py-2 rounded-lg`}
                                        >
                                            {PRIORITY_LEVELS.map((level) => (
                                                <option key={level} value={level}>{capitalize(level)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-tmid text-sm mb-1">
                                            {t("Recurring Type")}
                                        </label>
                                        <select
                                            value={newTask.recurringType}
                                            onChange={(e) =>
                                                handleTaskInputChange("recurringType", e.target.value)
                                            }
                                            className={`${isLightMode ? "bg-dark" : "bg-secondary"
                                                } border-none outline-none w-full px-4 py-2 rounded-lg`}
                                        >
                                            {RECURRING_TYPES.map((type) => (
                                                <option key={type} value={type}>{capitalize(type)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-tmid text-sm mb-1">
                                            {t("Interval (Days)")}
                                        </label>
                                        <input
                                            type="number"
                                            value={newTask.intervalDays}
                                            onChange={(e) =>
                                                handleTaskInputChange(
                                                    "intervalDays",
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            min="1"
                                            className={`${isLightMode ? "bg-dark" : "bg-secondary"
                                                } border-none outline-none w-full px-4 py-2 rounded-lg`}
                                            placeholder={t("Enter interval in days")}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-tmid text-sm mb-1">
                                            {t("Estimated Hours")}
                                        </label>
                                        <input
                                            type="number"
                                            value={newTask.estimatedHours}
                                            onChange={(e) =>
                                                handleTaskInputChange(
                                                    "estimatedHours",
                                                    parseFloat(e.target.value)
                                                )
                                            }
                                            min="0.5"
                                            step="0.5"
                                            className={`${isLightMode ? "bg-dark" : "bg-secondary"
                                                } border-none outline-none w-full px-4 py-2 rounded-lg`}
                                            placeholder={t("Enter estimated hours")}
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="taskIsActive"
                                            checked={newTask.isActive}
                                            onChange={(e) =>
                                                handleTaskInputChange("isActive", e.target.checked)
                                            }
                                            className="mr-2 cursor-pointer"
                                        />
                                        <label
                                            htmlFor="taskIsActive"
                                            className="text-tmid cursor-pointer"
                                        >
                                            {t("Is Active")}
                                        </label>
                                    </div>
                                </div>

                                {/* Instructions Section */}
                                <div className="mt-4">
                                    <h5 className="text-sm font-medium mb-2">{t("Instructions")}</h5>

                                    {newTask.instructions && newTask.instructions.length > 0 && (
                                        <div className="mb-3 bg-secondary/20 p-2 rounded">
                                            <ul className="space-y-1">
                                                {newTask.instructions.map((instruction, index) => (
                                                    <li key={index} className="flex items-center justify-between text-sm">
                                                        <span>{instruction}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveInstruction(index)}
                                                            className="text-red-400 hover:text-red-500"
                                                        >
                                                            <MinusCircle size={14} />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newInstruction}
                                            onChange={(e) => setNewInstruction(e.target.value)}
                                            className={`${isLightMode ? "bg-dark" : "bg-secondary"
                                                } border-none outline-none flex-1 px-4 py-2 rounded-lg`}
                                            placeholder={t("Enter instruction")}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddInstruction}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center"
                                        >
                                            <Plus size={16} className="mr-1" />
                                            {t("Add")}
                                        </button>
                                    </div>
                                </div>

                                {/* SubTasks Section */}
                                <div className="mt-4">
                                    <h5 className="text-sm font-medium mb-2">{t("Subtasks")}</h5>

                                    {newTask.subTasks && newTask.subTasks.length > 0 && (
                                        <div className="mb-3 bg-secondary/20 p-2 rounded space-y-2">
                                            {newTask.subTasks.map((subtask, index) => (
                                                <div key={index} className="flex justify-between bg-secondary/30 p-2 rounded">
                                                    <div>
                                                        <div className="font-medium text-sm">{subtask.name}</div>
                                                        <div className="text-xs text-gray-300">{subtask.description}</div>
                                                        <div className="text-xs text-gray-400">{t("Est.")}: {subtask.estimatedHours}h</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSubTask(index)}
                                                        className="text-red-400 hover:text-red-500 self-center"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="bg-secondary/10 p-3 rounded">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-tmid text-xs mb-1">
                                                    {t("Subtask Name")}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newSubTask.name}
                                                    onChange={(e) => handleSubTaskInputChange("name", e.target.value)}
                                                    className={`${isLightMode ? "bg-dark" : "bg-secondary"
                                                        } border-none outline-none w-full px-3 py-1.5 rounded-lg text-sm`}
                                                    placeholder={t("Enter subtask name")}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-tmid text-xs mb-1">
                                                    {t("Description")}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newSubTask.description}
                                                    onChange={(e) => handleSubTaskInputChange("description", e.target.value)}
                                                    className={`${isLightMode ? "bg-dark" : "bg-secondary"
                                                        } border-none outline-none w-full px-3 py-1.5 rounded-lg text-sm`}
                                                    placeholder={t("Enter description")}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-tmid text-xs mb-1">
                                                    {t("Estimated Hours")}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={newSubTask.estimatedHours}
                                                    onChange={(e) => handleSubTaskInputChange("estimatedHours", parseFloat(e.target.value))}
                                                    min="0.5"
                                                    step="0.5"
                                                    className={`${isLightMode ? "bg-dark" : "bg-secondary"
                                                        } border-none outline-none w-full px-3 py-1.5 rounded-lg text-sm`}
                                                    placeholder={t("Hours")}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={handleAddSubTask}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center text-sm w-full"
                                                >
                                                    <Plus size={14} className="mr-1" />
                                                    {t("Add Subtask")}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between mt-4">
                                    {editingTaskIndex !== null ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                                            >
                                                {t("Cancel Edit")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAddTask}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                            >
                                                {t("Update Task")}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={toggleAddTaskForm}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                                            >
                                                {t("Cancel")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAddTask}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                            >
                                                {t("Add Task")}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default RoutineTasksSection; 