import useCustomQuery from "@/hooks/useCustomQuery";
import useQueryPageData from "@/hooks/useQueryPageData";
import {
  DepartmentFormInputs,
  DepartmentType,
} from "@/types/DepartmentType.type";
import { FileObject } from "@/types/FileManager.type";
import { JobCategoryType } from "@/types/JobTitle.type";
import { DeptTree } from "@/types/trees/Department.tree.type";
import { useEffect, useState } from "react";
import { UseFormReset } from "react-hook-form";

export const useAddDeptLogic = (reset: UseFormReset<DepartmentFormInputs>) => {
  const [supportingFiles, setSupportingFiles] = useState<FileObject[]>([]);
  const [requiredReportsFiles, setRequiredReportsFiles] = useState<
    FileObject[]
  >([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [requiredCategoryOptions, setRequiredCategoryOptions] = useState<
    string[]
  >(["primary-department", "secondary-department", "sub-department"]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  type processedDepartmentFormInputs = Omit<
    DepartmentFormInputs,
    "parent_department_id"
  > & {
    parent_department: string;
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const departmentData = useQueryPageData<processedDepartmentFormInputs>(reset);

  const { data: departments } = useCustomQuery<{
    info: DepartmentType[];
    tree: DeptTree[];
  }>({ queryKey: ["departments"], url: `/department/tree` });

  const { data: categories } = useCustomQuery<JobCategoryType[]>({
    queryKey: ["categories"],
    url: `/job-categories`,
  });

  useEffect(() => {
    if (categories) {
      setAvailableCategories(categories.map((category) => category.name));
    }
  }, [categories]);

  useEffect(() => {
    if (departmentData) {
      // Properly initialize category and parent department
      reset({
        ...departmentData,
        supportingFiles: departmentData.supportingFiles ?? [],
        // Ensure we extract the ID correctly from parent_department
        parent_department_id: departmentData.parent_department ?
          (typeof departmentData.parent_department === 'object' && departmentData.parent_department !== null) ?
            departmentData.parent_department.id : departmentData.parent_department :
          '',
        // Make sure category is correctly set
        category: departmentData.category || ''
      });

      // Log the values to confirm correct initialization
      console.log('Initializing department form with:', {
        parentDept: departmentData.parent_department,
        category: departmentData.category
      });
    } else {
      reset();
    }
  }, [departmentData, reset, categories]);

  return {
    supportingFiles,
    setSupportingFiles,
    requiredReportsFiles,
    setRequiredReportsFiles,
    isAddingCategory,
    setIsAddingCategory,
    newCategory,
    setNewCategory,
    requiredCategoryOptions,
    setRequiredCategoryOptions,
    availableCategories,
    departmentData,
    departments,
    categories,
  };
};
