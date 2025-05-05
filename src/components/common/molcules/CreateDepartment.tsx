/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMokkBar } from "@/components/Providers/Mokkbar";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import { addDeptPopupSchema } from "@/schemas/department.schema";
import {
  CreateDepartmentProps,
  DepartmentFormInputs,
  DepartmentType,
} from "@/types/DepartmentType.type";
import getErrorMessages from "@/utils/handleErrorMessages";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";

const CreateDepartment: React.FC<CreateDepartmentProps> = ({
  isOpen,
  onClose,
  departmentData,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepartmentFormInputs>({
    resolver: yupResolver(addDeptPopupSchema) as any,
    defaultValues: departmentData || {},
  });

  React.useEffect(() => {
    if (departmentData) {
      reset(departmentData);
    } else {
      reset();
    }
  }, [departmentData, reset]);

  const { setSnackbarConfig } = useMokkBar();
  const endpoint = departmentData
    ? `/department/updateDepartment/${departmentData.id}`
    : `/department/create-department`;
  const {
    mutate: addDepartment,
    isPending: isPendingDepartment,
    isSuccess: isSuccessDepartment,
    isError: isErrorDepartment,
    error: errorDepartment,
  } = useCreateMutation({
    endpoint: endpoint,
    onSuccessMessage: t("Department added successfully!"),
    invalidateQueryKeys: ["departments"],
  });

  const onSubmit = async (data: DepartmentFormInputs) => {
    addDepartment({
      name: data.name,
      description: data.description,
      ...(data.parent_department_id && {
        parent_department_id: data.parent_department_id,
      }),
    });

    setInterval(onClose, 3000);
  };

  useEffect(() => {
    if (isSuccessDepartment) {
      setSnackbarConfig({
        open: true,
        message: departmentData
          ? t("Department updated successfully!")
          : t("Department created successfully!"),
        severity: "success",
      });

      reset({
        id: "",
        parent_department_id: "",
        description: "",
        name: "",
      });
    } else if (isErrorDepartment) {
      console.error("Failed to create/update the department", errorDepartment);
    }
  }, [
    departmentData,
    errorDepartment,
    isErrorDepartment,
    isSuccessDepartment,
    reset,
    setSnackbarConfig,
    t,
  ]);

  const { data: departments } = useCustomQuery<DepartmentType[]>({
    queryKey: ["departments"],
    url: `/department/get-departments`,
  });

  console.log("departments af a7 : ", departments);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      getErrorMessages({ errors, setSnackbarConfig });
    }
  }, [errors, setSnackbarConfig]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      contentLabel={t("Create/Update Department")}
      className="fixed inset-0 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 hover:text-accent"
        >
          &times;
        </button>
        <h1 className="text-center text-2xl font-bold mb-6">
          {departmentData ? t("Update Department") : t("Create Department")}
        </h1>
        <form className="gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium">
              {t("Department Name")}
            </label>
            <input
              type="text"
              {...register("name")}
              className={`w-full px-4 py-2 mt-1 rounded-lg placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-accent border ${errors.name ? "border-high" : "border-border"
                }`}
              placeholder={t("Enter department name")}
            />
            {errors.name && (
              <p className="text-red-500 mt-1 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("Description")}
            </label>
            <textarea
              {...register("description")}
              className={`w-full px-4 py-2 mt-1 rounded-lg placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-accent border ${errors.description ? "border-high" : "border-border"
                }`}
              placeholder={t("Enter department description")}
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              {t("Parent Department (Optional)")}
            </label>
            <select
              {...register("parent_department_id")}
              className={`w-full px-4 py-2 mt-1 rounded-lg placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-accent border ${errors.parent_department_id ? "border-high" : "border-border"
                }`}
            >
              <option value="">{t("Select a parent department")}</option>
              {departments &&
                departments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
            </select>
            {errors.parent_department_id && (
              <p className="text-red-500 mt-1 text-sm">
                {errors.parent_department_id.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-2 mt-4 bg-[#413d99] text-twhite rounded-lg font-bold hover:bg-opacity-90 transition duration-200 ${isPendingDepartment ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={isPendingDepartment}
          >
            {isPendingDepartment
              ? departmentData
                ? t("Updating...")
                : t("Creating...")
              : departmentData
                ? t("Update Department")
                : t("Create Department")}
          </button>
          {isErrorDepartment && (
            <p className="text-red-500 mt-2 text-center">
              {t("Error")}: {errorDepartment + ""}
            </p>
          )}
          {isSuccessDepartment && (
            <p className="text-low mt-2 text-center">{t("Successful")}</p>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default CreateDepartment;
