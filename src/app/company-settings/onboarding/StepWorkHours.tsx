"use client";
import React, { useState } from "react";
import { WorkingHoursTimeline, WorkDay, DayWorkingHours, CompanySettings } from "@/app/company-settings/page";
import useLanguage from "@/hooks/useLanguage";

interface StepWorkHoursProps {
  data: CompanySettings;
  onChange: (changes: Partial<CompanySettings>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  onFinish: () => void;
}

const defaultT = (s: string) => s;

const allWorkDays = Object.values(WorkDay);

const StepWorkHours: React.FC<StepWorkHoursProps> = ({ data, onChange, onNext, onBack, isFirstStep, isLastStep, onFinish }) => {
  const { t } = useLanguage();
  const [workingHoursErrors, setWorkingHoursErrors] = useState<Record<WorkDay, string>>({
    [WorkDay.SUNDAY]: "",
    [WorkDay.MONDAY]: "",
    [WorkDay.TUESDAY]: "",
    [WorkDay.WEDNESDAY]: "",
    [WorkDay.THURSDAY]: "",
    [WorkDay.FRIDAY]: "",
    [WorkDay.SATURDAY]: "",
  });

  // Merge in any missing days as non-working days
  const mergedDayWorkingHours = allWorkDays.map(day => {
    return (
      data.workSettings.dayWorkingHours?.find(dwh => dwh.day === day) || {
        day,
        isWorkingDay: false,
        startTime: "",
        endTime: "",
        breakTimeMinutes: 0,
      }
    );
  });

  // Handler to update a day's working hours
  const onDayWorkingHoursChange = (day: WorkDay, field: keyof DayWorkingHours, value: string | number | boolean | undefined) => {
    const updated = {
      ...data,
      workSettings: {
        ...data.workSettings,
        dayWorkingHours: mergedDayWorkingHours.map(dwh =>
          dwh.day === day ? { ...dwh, [field]: value } : dwh
        )
      }
    };
    // Validation: check if startTime < endTime for this day
    const changedDay = updated.workSettings.dayWorkingHours?.find(dwh => dwh.day === day);
    let errorMsg = "";
    if (changedDay?.isWorkingDay && changedDay.startTime && changedDay.endTime) {
      const [sh, sm] = changedDay.startTime.split(":").map(Number);
      const [eh, em] = changedDay.endTime.split(":").map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;
      if (startMinutes >= endMinutes) {
        errorMsg = t("Start time must be before end time.");
      }
    }
    setWorkingHoursErrors(prevErrs => ({ ...prevErrs, [day]: errorMsg }));
    onChange({ workSettings: { ...updated.workSettings } });
  };

  // Handler to toggle a work day
  const onWorkDayToggle = (day: WorkDay) => {
    const dayWorkingHours = mergedDayWorkingHours;
    const dayIndex = dayWorkingHours.findIndex(dwh => dwh.day === day);
    if (dayIndex !== -1) {
      const currentDay = dayWorkingHours[dayIndex];
      const isCurrentlyWorking = currentDay.isWorkingDay;
      onDayWorkingHoursChange(day, 'isWorkingDay', !isCurrentlyWorking);
      // If enabling work day, set default times if not already set
      if (!isCurrentlyWorking) {
        if (!currentDay.startTime) {
          onDayWorkingHoursChange(day, 'startTime', "09:00");
        }
        if (!currentDay.endTime) {
          onDayWorkingHoursChange(day, 'endTime', "17:00");
        }
        if (!currentDay.breakTimeMinutes) {
          onDayWorkingHoursChange(day, 'breakTimeMinutes', data.workSettings.defaultBreakTimeMinutes || 60);
        }
      }
    }
  };

  return (
    <div>
      <WorkingHoursTimeline
        dayWorkingHours={mergedDayWorkingHours}
        onDayWorkingHoursChange={onDayWorkingHoursChange}
        onWorkDayToggle={onWorkDayToggle}
        isEditing={true}
        t={t}
        companySettings={data}
        workingHoursErrors={workingHoursErrors}
      />
      <div className="flex justify-between p-4">
        {!isFirstStep && (
          <button onClick={onBack} className="flex items-center space-x-2 px-6 py-3 bg-main text-twhite font-medium rounded-xl transition-colors hover:bg-secondary">{t("Back")}</button>
        )}
        {!isLastStep ? (
          <button onClick={onNext} className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-secondary text-twhite font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl">{t("Continue")}</button>
        ) : (
          <button onClick={onFinish} className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-secondary text-twhite font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl">{t("Finish")}</button>
        )}
      </div>
    </div>
  );
};

export default StepWorkHours;