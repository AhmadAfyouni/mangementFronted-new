const TransactionEmptyState = ({ t }: { t: (key: string) => string }) => (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <h3 className="text-xl font-medium text-twhite mb-2">
      {t("No Transactions Found")}
    </h3>
    <p className="text-tmid">{t("Start by creating a new transaction")}</p>
  </div>
);
export default TransactionEmptyState;
