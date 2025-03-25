import {
  CategoryIcon,
  DepartmentsIcon,
  EmployeesIcon,
  HomeIcon,
  JobsIcon,
  ProjectIcon,
  TasksIcon,
  TemplateIcon,
  TransactionIcon,
} from "@/assets";

export const sidebarItems = [
  {
    label: "Home",
    icon: HomeIcon,
    path: "/home",
    requiredPermissions: [],
  },
  {
    label: "Projects",
    icon: ProjectIcon,
    path: "/projects",
    requiredPermissions: [],
  },
  {
    label: "Tasks Management",
    icon: TasksIcon,
    path: "/tasks",
    requiredPermissions: [],
  },
  {
    label: "Employees Management",
    icon: EmployeesIcon,
    path: "/employees",
    requiredPermissions: ["emp_search_and_view", "emp_view_specific"],
  },
  {
    label: "Departments Management",
    icon: DepartmentsIcon,
    path: "/departments",
    requiredPermissions: [
      "department_search_and_view",
      "department_view_specific",
    ],
  },
  {
    label: "Job Titles Management",
    icon: JobsIcon,
    path: "/jobs",
    requiredPermissions: [
      "job_title_search_and_view",
      "job_title_view_specific",
    ],
  },
  {
    label: "Job Categories Management",
    icon: CategoryIcon,
    path: "/categories",
    requiredPermissions: ["job_title_category_search_and_view"],
  },
  {
    label: "Transactions Templates",
    icon: TemplateIcon,
    path: "/templates",
    requiredPermissions: [],
  },
  {
    label: "Transactions",
    icon: TransactionIcon,
    path: "/transactions",
    requiredPermissions: [],
  },
];
