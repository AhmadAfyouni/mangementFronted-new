/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { FormInput, FormSection, FormSelect } from "./FormComponents";

const PersonalInfoSection = ({
  register,
  errors,
  isLightMode,
  employeeData,
  getValues
}) => {

  return (
    <FormSection title="Personal Information" isLightMode={isLightMode}>
      <FormInput
        label="Name"
        name="name"
        register={register}
        errors={errors}
        placeholder="Enter employee name"
        isLightMode={isLightMode}
      />

      <FormInput
        label="Email"
        name="email"
        register={register}
        errors={errors}
        placeholder="Enter employee email"
        isLightMode={isLightMode}
      />

      <FormInput
        label="Phone"
        name="phone"
        register={register}
        errors={errors}
        placeholder="Enter employee phone"
        isLightMode={isLightMode}
      />

      <FormInput
        label="Password"
        name="password"
        type="password"
        register={register}
        errors={errors}
        placeholder={
          employeeData
            ? "Can't update employee password"
            : "Enter employee password"
        }
        disabled={!!employeeData}
        isLightMode={isLightMode}
      />

      <FormInput
        label="National ID"
        name="national_id"
        register={register}
        errors={errors}
        placeholder="Enter national ID"
        isLightMode={isLightMode}
      />

      <FormInput
        label="Address"
        name="address"
        register={register}
        errors={errors}
        placeholder="Enter address"
        isLightMode={isLightMode}
      />

      <FormInput
        label="Emergency Contact"
        name="emergency_contact"
        register={register}
        errors={errors}
        placeholder="Enter emergency contact"
        isLightMode={isLightMode}
      />

      <FormInput
        label="Date of Birth"
        name="dob"
        type="date"
        register={register}
        errors={errors}
        placeholder="Select date of birth"
        isLightMode={isLightMode}
      />

      <FormSelect
        label="Gender"
        name="gender"
        register={register}
        errors={errors}
        options={[
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "undefined", label: "Undefined" }
        ]}
        isLightMode={isLightMode}
      />

      <FormSelect
        label="Marital Status"
        name="marital_status"
        register={register}
        errors={errors}
        options={[
          { value: "single", label: "Single" },
          { value: "married", label: "Married" }
        ]}
        value={getValues("marital_status") || ""}
        isLightMode={isLightMode}
      />
    </FormSection>
  );
};

export default PersonalInfoSection;