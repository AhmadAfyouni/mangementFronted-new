"use client";

import { PencilIcon } from "@/assets";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomTheme from "@/hooks/useCustomTheme";
import useSetPageData from "@/hooks/useSetPageData";
import { EmployeeType } from "@/types/EmployeeType.type";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import FilesButton from "../atoms/employees/FilesDropdown";

const EmployeesContent: React.FC<{
  employeesData: EmployeeType[];
}> = ({ employeesData }) => {
  const { t } = useTranslation();
  const isAdmin = useRolePermissions("admin");
  const hasEditPermission = usePermissions(["emp_update"]);
  const { isLightMode } = useCustomTheme();

  const { NavigateButton } = useSetPageData<EmployeeType>(
    "/employees/add-employee"
  );

  return (
    <div className="bg-secondary rounded-xl shadow-md p-4 flex flex-col space-y-4 col-span-12 ">
      {employeesData && employeesData.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-main rounded-lg text-twhite shadow-md">
            <thead
              className={` ${
                isLightMode
                  ? "bg-darkest text-tblackAF"
                  : "bg-tblack text-twhite"
              }  `}
            >
              <tr>
                <th className=" text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("Name")}
                </th>
                <th className=" text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("DOB")}
                </th>
                <th className=" text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("Phone")}
                </th>
                <th className=" text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("Email")}
                </th>
                <th className=" text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("Address")}
                </th>
                <th className=" text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("Department")}
                </th>
                <th className=" text-center py-3 px-4 uppercase font-semibold text-sm">
                  {t("Job")}
                </th>
                {(isAdmin || hasEditPermission) && (
                  <th className=" text-center py-3 px-4 uppercase font-semibold text-sm">
                    {t("Actions")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {employeesData.map((employee) => (
                <tr
                  key={employee.id}
                  className={` ${
                    isLightMode
                      ? "hover:bg-darker text-blackAF hover:text-tblackAF"
                      : "hover:bg-slate-700 text-twhite"
                  }  group transition-colors`}
                >
                  <td className="text-center py-3 px-4">
                    {employee.name + " - " + employee.job.title}
                  </td>
                  <td className="text-center py-3 px-4">
                    {new Date(employee.dob).toLocaleDateString()}
                  </td>
                  <td className="text-center py-3 px-4">{employee.phone}</td>
                  <td className="text-center py-3 px-4">{employee.email}</td>
                  <td className="text-center py-3 px-4">{employee.address}</td>
                  <td className="text-center py-3 px-4">
                    {employee.department?.name}
                  </td>
                  <td className="text-center py-3 px-4">
                    {employee.job.title}
                  </td>
                  {(isAdmin || hasEditPermission) && (
                    <td className="text-center py-3 px-4 flex gap-2">
                      {(isAdmin || hasEditPermission) && (
                        <NavigateButton
                          data={employee}
                          className="cursor-pointer p-2 w-16 text-xs flex justify-center font-bold rounded-full bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30"
                        >
                          {/* {t("Edit")} */}
                          <Image
                            src={PencilIcon}
                            alt="edit icon"
                            height={20}
                            width={20}
                          />
                        </NavigateButton>
                      )}
                      {/* Files button */}
                      <FilesButton
                        employee={employee}
                        isLightMode={isLightMode}
                      />
                      {
                        // (isAdmin || hasDeletePermission) && (
                        //   <div className="cursor-pointer p-2 w-16 text-xs flex justify-center font-bold rounded-full bg-red-500/40 border-2 border-red-500/30 hover:text-red-100 hover:bg-red-500">
                        //     {/* {t("Delete")} */}
                        //     <Image
                        //       src={TrashIcon}
                        //       alt="delete icon"
                        //       height={20}
                        //       width={20}
                        //     />
                        //   </div>
                        // )
                      }
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-tdark mt-4">
          {t("No employees found.")}
        </p>
      )}
    </div>
  );
};

export default EmployeesContent;
