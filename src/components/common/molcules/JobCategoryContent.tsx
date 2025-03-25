"use client";

import { PencilIcon } from "@/assets";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomTheme from "@/hooks/useCustomTheme";
import useLanguage from "@/hooks/useLanguage";
import useSetPageData from "@/hooks/useSetPageData";
import { JobCategoryType } from "@/types/JobTitle.type";
import Image from "next/image";
import { useState } from "react";
import CustomModal from "../atoms/modals/CustomModal";
import PageSpinner from "../atoms/ui/PageSpinner";

const SkillsList = ({
  skills,
  onShowMore,
}: {
  skills: string[];
  onShowMore: () => void;
}) => {
  const { t } = useLanguage();
  const { isLightMode } = useCustomTheme();

  const shouldShowMore = skills.length > 2;
  const displaySkills = skills.slice(0, 2);

  return (
    <div className="flex flex-col gap-2">
      <ul className="list-disc ml-4">
        {displaySkills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>

      {shouldShowMore && (
        <button
          onClick={onShowMore}
          className={`
            flex items-center justify-center gap-2 
            mt-1 py-1 px-2 rounded-lg
            text-xs font-medium transition-all duration-200
            ${
              isLightMode
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-primary/20 text-primary hover:bg-primary/30"
            }
          `}
        >
          <span>{t("Show More")}</span>
          <span className="text-xs opacity-60">(+{skills.length - 2})</span>
        </button>
      )}
    </div>
  );
};

const JobCategoryContent = () => {
  const { t, currentLanguage } = useLanguage();
  const isAdmin = useRolePermissions("admin");
  const hasEditPermission = usePermissions(["job_title_category_update"]);
  const {
    data: categories,
    isLoading,
    error,
  } = useCustomQuery<JobCategoryType[]>({
    queryKey: ["jobTitles"],
    url: `/job-categories`,
  });
  const { isLightMode } = useCustomTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string[]>([]);

  const handleShowMoreSkills = (skills: string[]) => {
    setModalContent(skills);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent([]);
  };

  const { NavigateButton } = useSetPageData<JobCategoryType>(
    "/categories/add-category"
  );

  if (isLoading || !categories) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-1/2 flex flex-col items-center justify-center gap-5">
        <PageSpinner />
      </div>
    );
  }

  if (!categories || categories.length == 0) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-1/2 flex flex-col items-center justify-center gap-5 text-twhite">
        {t("No Job Categories Found")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-500">
          {t("Failed to load job categories.")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-xl shadow-md p-4 flex flex-col space-y-4 col-span-12">
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-full bg-main text-twhite rounded-lg shadow-md">
          <thead
            className={` ${
              isLightMode ? "bg-darkest text-tblackAF" : "bg-tblack text-twhite"
            }  `}
          >
            <tr>
              <th className="text-center  py-3 px-4 uppercase font-semibold text-sm">
                {t("Name")}
              </th>
              <th className="text-center  py-3 px-4 uppercase font-semibold text-sm">
                {t("Description")}
              </th>
              <th className="text-center  py-3 px-4 uppercase font-semibold text-sm">
                {t("Required Education")}
              </th>
              <th className="text-center  py-3 px-4 uppercase font-semibold text-sm">
                {t("Required Experience")}
              </th>
              <th className="text-center  py-3 px-4 uppercase font-semibold text-sm">
                {t("Required Skills")}
              </th>
              {(isAdmin || hasEditPermission) && (
                <th className="text-center  py-3 px-4 uppercase font-semibold text-sm">
                  {t("Actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {categories &&
              categories.map((category) => (
                <tr
                  key={category.id}
                  className={` ${
                    isLightMode
                      ? "hover:bg-darker text-blackAF hover:text-tblackAF"
                      : "hover:bg-slate-700 text-twhite"
                  }  group transition-colors`}
                >
                  <td className="py-3 px-4 text-center">
                    {category && category.name}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {category && category.description}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {category && category.required_education}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {category && category.required_experience}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {category &&
                    category.required_skills &&
                    category.required_skills.length > 0 ? (
                      <SkillsList
                        skills={category.required_skills}
                        onShowMore={() =>
                          handleShowMoreSkills(category.required_skills)
                        }
                      />
                    ) : (
                      t("N/A")
                    )}
                  </td>
                  {(isAdmin || hasEditPermission) && (
                    <td className="py-3 px-4 flex gap-2">
                      {(isAdmin || hasEditPermission) && (
                        <NavigateButton
                          data={category}
                          className="cursor-pointer p-2 w-16 text-xs flex justify-center font-bold rounded-full bg-green-500/40 hover:bg-green-500 hover:text-green-100 border-2 border-green-500/30"
                        >
                          <Image
                            src={PencilIcon}
                            alt="edit icon"
                            height={20}
                            width={20}
                          />
                        </NavigateButton>
                      )}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <CustomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={t("Skills")}
        content={modalContent}
        language={currentLanguage as "en" | "ar"}
        actionText={t("Close")}
      />
    </div>
  );
};

export default JobCategoryContent;
