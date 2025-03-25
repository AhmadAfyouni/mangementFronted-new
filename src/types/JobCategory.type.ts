import { Dispatch, SetStateAction } from "react";
import { UseFormSetValue } from "react-hook-form";

export interface JobCategoryFormInputs {
  id: string;
  name: string;
  description: string;
  required_education: string;
  required_experience: string;
  required_skills: string[];
}

export interface AddEducationHandlerParams {
  newEducation: string;
  setValue: UseFormSetValue<JobCategoryFormInputs>;
  setRequiredEducationOptions: Dispatch<SetStateAction<string[]>>;
}
export interface AddExperienceHandlerParams {
  newExperience: string;
  setValue: UseFormSetValue<JobCategoryFormInputs>;
  setRequiredExperienceOptions: Dispatch<SetStateAction<string[]>>;

}






export interface EducationExperienceData {
  requiredEducation: string[];
  requiredExperience: string[];
}

export interface AddEducationParams {
  newEducation: string;
  setIsAddingEducation: (value: boolean) => void;
  setNewEducation: (value: string) => void;
  setRequiredEducationOptions: (options: string[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: (name: keyof JobCategoryFormInputs, value: any) => void;
}

export interface AddExperienceParams extends AddEducationParams {
  setRequiredExperienceOptions: (options: string[]) => void;
}
