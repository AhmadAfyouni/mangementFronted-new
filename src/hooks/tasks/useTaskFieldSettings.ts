import { CompanySettingsType } from "@/types/CompanySettings.type";
import useCustomQuery from "../useCustomQuery";

/**
 * Returns the current task field settings from the company settings API.
 */
export function useTaskFieldSettings(): CompanySettingsType['taskFieldSettings'] | undefined {
    const { data: companySettings } = useCustomQuery<CompanySettingsType>({
        queryKey: ["company-settings"],
        url: "/company-settings",
        nestedData: true,
    });
    return companySettings?.taskFieldSettings;
}

/**
 * Guard hook: returns true if ALL the given features are enabled in task field settings.
 * @param features Array of TaskFieldSettings keys
 */
export function useTasksGuard(features: (keyof CompanySettingsType['taskFieldSettings'])[]): boolean {
    const settings = useTaskFieldSettings();
    if (!settings) return false; // or true if you want to show by default while loading
    return features.every((key) => !!settings[key]);
}