import RouteWrapper from "../ui/RouteWrapper";

const TemplateEmptyState = ({ t }: { t: (key: string) => string }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
    <div className="bg-secondary rounded-full p-6 mb-4">
      <svg
        className="w-12 h-12 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    </div>
    <h3 className="text-xl font-medium text-twhite mb-2">
      {t("No Templates Found")}
    </h3>
    <p className="text-tmid mb-6">
      {t("Create your first template to get started")}
    </p>
    <RouteWrapper href="/templates/add-template">
      <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-md transition-colors duration-200">
        {t("Create Template")}
      </button>
    </RouteWrapper>
  </div>
);

export default TemplateEmptyState;
