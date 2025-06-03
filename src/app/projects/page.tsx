"use client";

import AddProjectModal from "@/components/common/atoms/modals/AddProjectModal";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import ProjectsContent from "@/components/common/molcules/ProjectsContent";
import useCustomTheme from "@/hooks/useCustomTheme";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const Page = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { isLightMode } = useCustomTheme();
  return (
    <GridContainer>
      <div className="col-span-full flex flex-col xs:flex-row justify-between items-center mb-5 gap-5">
        <h1
          className={`text-3xl font-bold  ${isLightMode ? "text-twhite " : "text-twhite"
            }  text-center `}
        >
          {t("Projects")}
        </h1>
        <div className="flex justify-center items-center gap-5 ">
          {
            <button
              type="button"
              className="bg-secondary text-twhite px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-200"
              onClick={() => setIsModalOpen(true)}
            >
              {t("Add Project")}
            </button>
          }
        </div>

        {isModalOpen && (
          <AddProjectModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
      <ProjectsContent />
    </GridContainer>
  );
};

export default Page;
