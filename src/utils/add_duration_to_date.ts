interface Duration {
  value: number;
  unit: "days" | "hours" | "months";
}

export const addDurationToDate = (
  startDate: string,
  duration: Duration,
  getDir: () => "rtl" | "ltr"
): string => {
  if (!startDate || !duration) return "";

  const { value, unit } = duration;
  const date = new Date(startDate);

  switch (unit) {
    case "days":
      date.setDate(Number(date.getDate()) + Number(value));
      break;
    case "hours":
      date.setHours(Number(date.getHours()) + Number(value));

      const returnedDate =
        getDir() == "rtl"
          ? date.toLocaleTimeString("ar", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour12: true,
            })
          : date.toLocaleTimeString("en", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour12: true,
            });
      return returnedDate;
    case "months":
      date.setMonth(Number(date.getMonth()) + Number(value));
      break;
    default:
      return "";
  }

  return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD format for days and months
};
