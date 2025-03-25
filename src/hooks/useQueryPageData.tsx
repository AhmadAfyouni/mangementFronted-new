// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { FieldValues, UseFormReset } from "react-hook-form";

// function useQueryData<T extends FieldValues>(
//   reset: UseFormReset<T>,
//   paramName: string = "data"
// ) {
//   const searchParams = useSearchParams();
//   const [queryData, setQueryData] = useState<T | null>(null);

//   useEffect(() => {
//     const dataParam = searchParams.get(paramName);
//     if (dataParam) {
//       const parsedData = JSON.parse(decodeURIComponent(dataParam)) as T;
//       setQueryData(parsedData);
//       reset(parsedData);
//     } else {
//       reset();
//     }
//   }, [reset, searchParams, paramName]);

//   return queryData;
// }

// export default useQueryData;

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
        const parsedData = JSON.parse(storedData) as T;
        setQueryData(parsedData);
        reset(parsedData); // Update form with parsed data
      }
    } else {
      reset(); // Reset form if no data is found
    }
  }, [reset, searchParams, paramName]);

  return queryData;
}

export default useQueryData;
