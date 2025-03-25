const TemplateLoadingSkeleton = () => (
  <div className="border border-slate-600 rounded-lg p-6 bg-dark animate-pulse">
    <div className="h-6 bg-secondary rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-secondary rounded w-full mb-2"></div>
    <div className="h-4 bg-secondary rounded w-5/6 mb-4"></div>
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-secondary rounded w-1/3"></div>
      <div className="h-4 bg-secondary rounded w-1/2"></div>
    </div>
    <div className="h-10 bg-secondary rounded w-full mt-4"></div>
  </div>
);
export default TemplateLoadingSkeleton;
