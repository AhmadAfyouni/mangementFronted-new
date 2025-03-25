"use client";

import GridContainer from "@/components/common/atoms/ui/GridContainer";
import JobTitleContent from "@/components/common/molcules/JobTitleContent";
import RouteWrapper from "@/components/common/atoms/ui/RouteWrapper";
import {
  usePermissions,
  useRolePermissions,
} from "@/hooks/useCheckPermissions";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const JobTitlesView: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState("get-job-titles");
  const isAdmin = useRolePermissions("admin");
  const { t } = useTranslation();

  const canViewSpecific = usePermissions(["job_title_view_specific"]);

  const showSelect = isAdmin || canViewSpecific;

  return (
    <GridContainer>
      <div className="col-span-full flex flex-col md:flex-row justify-between items-center gap-5 mb-5">
        <h1 className="text-3xl font-bold text-twhite text-center pb-4">
          {t("Job Titles")}
        </h1>
        <div className="flex justify-center flex-wrap items-center gap-5">
          {showSelect && (
            <select
              className="bg-secondary outline-none border-none text-twhite rounded-lg px-4 py-2 focus:outline-none transition duration-200"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              {isAdmin && (
                <option value="get-job-titles">{t("All Job Titles")}</option>
              )}
              {canViewSpecific && (
                <option value="view">{t("Accessible Job Titles")}</option>
              )}
            </select>
          )}
          {isAdmin && (
            <>
              <RouteWrapper href="/jobs/add-title">
                <div className="bg-secondary text-twhite px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-200">
                  {t("Add Job Title")}
                </div>
              </RouteWrapper>
            </>
          )}
        </div>
      </div>

      <JobTitleContent selectedOption={selectedOption} />
    </GridContainer>
  );
};

export default JobTitlesView;
