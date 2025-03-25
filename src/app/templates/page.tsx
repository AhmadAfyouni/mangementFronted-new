"use client";
import TemplateCard from "@/components/common/atoms/templates/TemplateCard";
import TemplateEmptyState from "@/components/common/atoms/templates/TemplateEmptyState";
import TemplateLoadingSkeleton from "@/components/common/atoms/templates/TemplateLoadingSkeleton";
import ErrorState from "@/components/common/atoms/ui/ErrorState";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import RouteWrapper from "@/components/common/atoms/ui/RouteWrapper";
import useCustomQuery from "@/hooks/useCustomQuery";
import useLanguage from "@/hooks/useLanguage";
import { templateType } from "@/types/new-template.type";

const calculateActiveDepartments = (templates: templateType[] | undefined) => {
  if (!templates) return 0;

  const uniqueDeptIds = new Set(
    templates.flatMap((t) => [
      ...t.departments_approval_track.map((d) => d.department._id),
      ...t.departments_execution_ids.map((d) => d.department._id),
      // ...t.departments_archive.map((d) => d._id),
    ])
  );

  return uniqueDeptIds.size;
};

// Main Templates Component
const Templates = () => {
  const { t } = useLanguage();

  const {
    data: templates,
    isLoading,
    error,
    refetch,
  } = useCustomQuery<templateType[]>({
    url: "/templates",
    queryKey: ["templates"],
  });

  const renderHeader = () => (
    <div className="col-span-full mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-5">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-twhite mb-2">
            {t("Transaction Templates")}
          </h1>
          <p className="text-tmid text-sm">
            {t("Select a template to initiate a new transaction")}
          </p>
        </div>
        <RouteWrapper href="/templates/add-template">
          <button className="bg-tblack hover:bg-dark text-twhite px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("Add New Template")}
          </button>
        </RouteWrapper>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-700/50 pb-6 mb-6">
      {/* Total Templates */}
      <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-tmid mb-1">{t("Total Templates")}</p>
          <p className="text-2xl font-semibold text-twhite">
            {templates?.length || 0}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center">
          <svg
            className="w-5 h-5 text-tmid"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>

      {/* With Admin Approval */}
      <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-tmid mb-1">{t("Requires Approval")}</p>
          <p className="text-2xl font-semibold text-twhite">
            {templates?.filter((t) => t.needAdminApproval).length || 0}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center">
          <svg
            className="w-5 h-5 text-tmid"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
      </div>

      {/* Active Departments */}
      <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-tmid mb-1">{t("Active Departments")}</p>
          <p className="text-2xl font-semibold text-twhite">
            {calculateActiveDepartments(templates)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center">
          <svg
            className="w-5 h-5 text-tmid"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (error) {
      return (
        <div className="bg-secondary rounded-xl p-8">
          <ErrorState
            message={t("Failed to load templates")}
            showRetry={true}
            onRetry={refetch}
          />
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="bg-secondary rounded-xl p-6 space-y-6">
          {[...Array(3)].map((_, i) => (
            <TemplateLoadingSkeleton key={`loading-${i}`} />
          ))}
        </div>
      );
    }

    if (!templates?.length) {
      return (
        <div className="bg-secondary rounded-xl p-8">
          <TemplateEmptyState t={t} />
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-center gap-2">
        {templates.map((template, index) => (
          <TemplateCard key={index} template={template} />
        ))}
      </div>
    );
  };

  return (
    <GridContainer>
      {renderHeader()}
      {renderStats()}
      {renderContent()}
    </GridContainer>
  );
};

export default Templates;
