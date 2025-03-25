import RouteWrapper from "@/components/common/atoms/ui/RouteWrapper";

function useSetPageData<T>(path: string, key = "pageData") {
  const setPageData = (data: T) => {
    sessionStorage.setItem(key, JSON.stringify(data)); // Store the data
  };

  const NavigateButton = ({
    data,
    children,
    className,
  }: {
    data: T;
    children: React.ReactNode;
    className?: string;
  }) => (
    <RouteWrapper
      href={`${path}?${key}=${key}`}
      onClick={() => setPageData(data)}
      className={className}
    >
      {children}
    </RouteWrapper>
  );

  return { NavigateButton };
}

export default useSetPageData;
