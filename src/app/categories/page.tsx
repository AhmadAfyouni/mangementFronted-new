"use client";

import GridContainer from "@/components/common/atoms/ui/GridContainer";
import JobCategoryContent from "@/components/common/molcules/JobCategoryContent";
import RouteWrapper from "@/components/common/atoms/ui/RouteWrapper";
import { useRolePermissions } from "@/hooks/useCheckPermissions";
import useLanguage from "@/hooks/useLanguage";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setActiveEntity } from "@/state/slices/searchSlice";

const Category = () => {
  const { t } = useLanguage();
  const isAdmin = useRolePermissions("admin");
  const dispatch = useDispatch();

  // Set active entity for global search when this page is loaded
  useEffect(() => {
    dispatch(setActiveEntity('jobCategories'));
  }, [dispatch]);

  return (
    <GridContainer>
      <div className="col-span-full flex flex-col md:flex-row gap-5 mb-5 justify-between items-center ">
        <h1 className="text-3xl font-bold text-twhite text-center mb-5">
          {t("Job Categories Management")}
        </h1>
        {isAdmin && (
          <RouteWrapper href="/categories/add-category">
            <div className="bg-secondary text-twhite px-6 py-2 rounded-lg hover:bg-opacity-90 transition duration-200">
              {t("Add Category")}
            </div>
          </RouteWrapper>
        )}
      </div>
      <JobCategoryContent />
    </GridContainer>
  );
};

export default Category;