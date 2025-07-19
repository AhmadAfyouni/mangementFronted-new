import { Building2, FolderOpen, GitBranch, Layers, Users } from "lucide-react";
import { UseFormRegister } from "react-hook-form";
import { TaskFormInputs } from "@/types/Task.type";
import { DepartmentType } from "@/types/DepartmentType.type";
import { EmployeeType } from "@/types/EmployeeType.type";
import { ProjectType } from "@/types/Project.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import { EmpTree } from "@/types/trees/Emp.tree.type";
import { TaskTree } from "@/types/trees/Task.tree.type";

// Define interfaces for API responses
interface SectionType {
    _id: string;
    name: string;
}

interface AssignmentSectionProps {
    register: UseFormRegister<TaskFormInputs>;
    t: (key: string) => string;
    employees?: {
        info: EmployeeType[];
        tree: EmpTree[];
    };
    departments?: {
        info: DepartmentType[];
        tree: DeptTree[];
    };
    projects?: ProjectType[];
    sections?: SectionType[];
    tasks?: TaskTree[];
    isEmployeeDisabled: boolean;
    isDepartmentDisabled: boolean;
    isProjectDisabled: boolean;
}

const AssignmentSection: React.FC<AssignmentSectionProps> = ({
    register,
    t,
    employees,
    departments,
    projects,
    sections,
    tasks,
    isEmployeeDisabled,
    isDepartmentDisabled,
    isProjectDisabled,
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project */}
            <div>
                <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-purple-400" />
                    {t("Project")}
                </label>
                <div className="relative">
                    <select
                        {...register("project_id")}
                        disabled={isProjectDisabled}
                        className={`w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors appearance-none ${isProjectDisabled ? "opacity-50 cursor-not-allowed bg-gray-800" : ""
                            }`}
                    >
                        <option value="">{t("Select Project")}</option>
                        {projects?.filter((proj) => proj.status == "IN_PROGRESS").map((project) => (
                            <option key={project._id} value={project._id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Department */}
            <div>
                <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    {t("Department")}
                </label>
                <div className="relative">
                    <select
                        {...register("department_id")}
                        disabled={isDepartmentDisabled}
                        className={`w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 focus:outline-none transition-colors appearance-none ${isDepartmentDisabled ? "opacity-50 cursor-not-allowed bg-gray-800" : ""
                            }`}
                    >
                        <option value="">{t("Select Department")}</option>
                        {departments?.tree?.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Employee Assignment */}
            <div>
                <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    {t("Assign to Employee")}
                </label>
                <div className="relative">
                    <select
                        {...register("emp")}
                        disabled={isEmployeeDisabled}
                        className={`w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none transition-colors appearance-none ${isEmployeeDisabled ? "opacity-50 cursor-not-allowed bg-gray-800" : ""
                            }`}
                    >
                        <option value="">{t("Select Employee")}</option>
                        {employees?.info?.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Section */}
            <div>
                <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-green-400" />
                    {t("Section")}
                </label>
                <div className="relative">
                    <select
                        {...register("section_id")}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-green-500 focus:ring focus:ring-green-500/20 focus:outline-none transition-colors appearance-none"
                    >
                        <option value="">{t("Select Section")}</option>
                        {sections?.map((section: SectionType) => (
                            <option key={section._id} value={section._id}>
                                {section.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Parent Task */}
            <div className="lg:col-span-2">
                <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-yellow-400" />
                    {t("Parent Task")}
                </label>
                <div className="relative">
                    <select
                        {...register("parent_task")}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-yellow-500 focus:ring focus:ring-yellow-500/20 focus:outline-none transition-colors appearance-none"
                    >
                        <option value="">{t("Select Parent Task")}</option>
                        {tasks?.map((task) => (
                            <option key={task.id} value={task.id}>
                                {task.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentSection; 