import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import React, { Dispatch, SetStateAction } from "react";

const AddCategoryField = ({newCategory,onClick,setNewCategory}:{
    newCategory:string,
    setNewCategory:Dispatch<SetStateAction<string>>,
    onClick:()=>void    
}) => {
    const {t} = useLanguage()
    const {isLightMode} = useCustomTheme()
  return (
    <>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          className={`    ${
            isLightMode ? "bg-dark  placeholder:text-tdark " : "bg-secondary"
          }  w-full  bg-secondary border-none outline-none  px-4 py-2 rounded-lg border `}
          placeholder={t("Enter new Category")}
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button
          type="button"
          onClick={onClick}
          className="bg-blue-500 text-twhite rounded-md px-4 py-2"
        >
          {t("Add")}
        </button>
      </div>
    </>
  );
};

export default AddCategoryField;
