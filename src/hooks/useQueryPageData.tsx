import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FieldValues, UseFormReset } from "react-hook-form";

function useQueryData<T extends FieldValues>(
  reset: UseFormReset<FieldValues>,
  paramName: string = "pageData"
) {
  const searchParams = useSearchParams();
  const [queryData, setQueryData] = useState<T | null>(null);

  useEffect(() => {
    const key = searchParams.get(paramName); // Retrieve the key
    if (key) {
      const storedData = sessionStorage.getItem(key); // Get data from storage
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData) as T;
          console.log('Retrieved data from session storage:', parsedData);

          // Process parent_department to ensure it's properly structured
          if (parsedData && typeof parsedData === 'object' && 'parent_department' in parsedData) {
            // Handle different data structures for parent_department
            const parentDept = (parsedData as any).parent_department;
            if (parentDept && typeof parentDept === 'object' && 'id' in parentDept) {
              // Already in the right format
              console.log('Parent department in object format:', parentDept);
            } else if (parentDept && typeof parentDept === 'string') {
              // Convert string to object format
              console.log('Converting parent department from string to object:', parentDept);
              (parsedData as any).parent_department = { id: parentDept };
            }
          }

          setQueryData(parsedData);
          reset(parsedData); // Update form with parsed data
        } catch (error) {
          console.error('Error parsing stored data:', error);
          reset();
        }
      }
    } else {
      reset(); // Reset form if no data is found
    }
  }, [reset, searchParams, paramName]);

  return queryData;
}

export default useQueryData;
