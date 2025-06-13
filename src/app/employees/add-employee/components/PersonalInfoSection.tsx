import React from "react";
import { useTranslation } from "react-i18next";
import { User, Phone, Mail, AlertCircle, Calendar, Key, IdCard, MapPin, PhoneOutgoing, Heart } from "lucide-react";
import { UseFormRegister, FieldErrors, UseFormGetValues } from "react-hook-form";
import { EmployeeFormInputs } from "@/types/EmployeeType.type";

const PersonalInfoSection = ({
  register,
  errors,
  employeeData,
  getValues
}: {
  register: UseFormRegister<EmployeeFormInputs>;
  errors: FieldErrors<EmployeeFormInputs>;
  employeeData: EmployeeFormInputs | null | undefined;
  getValues: UseFormGetValues<EmployeeFormInputs>;
}) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Name */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-purple-400" />
          {t("Name")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            {...register("name")}
            type="text"
            placeholder={t("Enter employee name")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors"
          />
          {errors.name && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.name && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.name.message}
          </p>
        )}
      </div>
      {/* Email */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-purple-400" />
          {t("Email")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            {...register("email")}
            type="email"
            placeholder={t("Enter employee email")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors"
          />
          {errors.email && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.email && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.email.message}
          </p>
        )}
      </div>
      {/* Phone */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Phone className="w-4 h-4 text-purple-400" />
          {t("Phone")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            {...register("phone")}
            type="text"
            placeholder={t("Enter employee phone")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors"
          />
          {errors.phone && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.phone && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.phone.message}
          </p>
        )}
      </div>
      {/* Password */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Key className="w-4 h-4 text-purple-400" />
          {t("Password")}
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type="password"
            placeholder={employeeData ? t("Can't update employee password") : t("Enter employee password")}
            disabled={!!employeeData}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors"
          />
          {errors.password && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.password && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.password.message}
          </p>
        )}
      </div>
      {/* National ID */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <IdCard className="w-4 h-4 text-purple-400" />
          {t("National ID")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            {...register("national_id")}
            type="text"
            placeholder={t("Enter national ID")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors"
          />
          {errors.national_id && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.national_id && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.national_id.message}
          </p>
        )}
      </div>
      {/* Address */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-400" />
          {t("Address")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            {...register("address")}
            type="text"
            placeholder={t("Enter address")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors"
          />
          {errors.address && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.address && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.address.message}
          </p>
        )}
      </div>
      {/* Emergency Contact */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <PhoneOutgoing className="w-4 h-4 text-purple-400" />
          {t("Emergency Contact")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            {...register("emergency_contact")}
            type="text"
            placeholder={t("Enter emergency contact")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors"
          />
          {errors.emergency_contact && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.emergency_contact && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.emergency_contact.message}
          </p>
        )}
      </div>
      {/* Date of Birth */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          {t("Date of Birth")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            {...register("dob")}
            type="date"
            placeholder={t("Select date of birth")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors"
          />
          {errors.dob && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.dob && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.dob.message}
          </p>
        )}
      </div>
      {/* Gender */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <HermaphroditicIcon className="w-4 h-4 text-purple-400" />
          {t("Gender")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <select
            {...register("gender")}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors appearance-none"
          >
            <option value="">{t("Select a gender")}</option>
            <option value="male">{t("Male")}</option>
            <option value="female">{t("Female")}</option>
            <option value="undefined">{t("Undefined")}</option>
          </select>
          {errors.gender && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.gender && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.gender.message}
          </p>
        )}
      </div>
      {/* Marital Status */}
      <div>
        <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Heart className="w-4 h-4 text-purple-400" />
          {t("Marital Status")} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <select
            {...register("marital_status")}
            value={getValues("marital_status") || ""}
            className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition-colors appearance-none"
          >
            <option value="">{t("Select a marital status")}</option>
            <option value="single">{t("Single")}</option>
            <option value="married">{t("Married")}</option>
          </select>
          {errors.marital_status && (
            <div className="absolute right-3 top-3.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.marital_status && (
          <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.marital_status.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;


// hermaphroditic icon svg
const HermaphroditicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 12l-6 6m6-6l6 6" />
  </svg>
);
