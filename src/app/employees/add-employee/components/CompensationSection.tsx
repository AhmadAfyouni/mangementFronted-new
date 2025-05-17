/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { DynamicFieldArray } from "./FormComponents";
import { useTranslation } from "react-i18next";

const CompensationSection = ({
  allowancesFields,
  appendAllowance,
  removeAllowance,
  incentivesFields,
  appendIncentive,
  removeIncentive,
  bankAccountsFields,
  appendBankAccount,
  removeBankAccount,
  register,
  errors,
  isLightMode,
  reset,
  getValues
}) => {
  const { t } = useTranslation();

  return (
    <div className={`p-4 rounded-lg mb-6 border ${isLightMode ? "bg-gray-50 border-gray-200" : "bg-dark border-gray-700"}`}>
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-700">
        {t("Compensation & Financial")}
      </h2>

      {/* Allowances Section */}
      <DynamicFieldArray
        title="Allowances"
        fields={allowancesFields}
        append={() => appendAllowance({ allowance_type: "", amount: 0 })}
        remove={removeAllowance}
        register={register}
        errors={errors}
        buttonText="Add Allowance"
        buttonColor="primary"
        isLightMode={isLightMode}
        reset={reset}
        getValues={getValues}
      >
        {(field, index) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Allowance Type")}
              </label>
              <input
                type="text"
                {...register(`allowances.${index}.allowance_type`)}
                placeholder={t("Enter allowance type")}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Amount")}
              </label>
              <input
                type="number"
                {...register(`allowances.${index}.amount`)}
                placeholder={t("Enter amount")}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
          </div>
        )}
      </DynamicFieldArray>

      {/* Incentives Section */}
      <DynamicFieldArray
        title="Incentives"
        fields={incentivesFields}
        append={() => appendIncentive({ description: "", amount: 0 })}
        remove={removeIncentive}
        register={register}
        errors={errors}
        buttonText="Add Incentive"
        buttonColor="success"
        isLightMode={isLightMode}
        reset={reset}
        getValues={getValues}
      >
        {(field, index) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Description")}
              </label>
              <input
                type="text"
                {...register(`incentives.${index}.description`)}
                placeholder={t("Enter description")}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Amount")}
              </label>
              <input
                type="number"
                {...register(`incentives.${index}.amount`)}
                placeholder={t("Enter amount")}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
          </div>
        )}
      </DynamicFieldArray>

      {/* Bank Accounts Section */}
      <DynamicFieldArray
        title="Bank Accounts"
        fields={bankAccountsFields}
        append={() => appendBankAccount({ bank_name: "", account_number: "" })}
        remove={removeBankAccount}
        register={register}
        errors={errors}
        buttonText="Add Bank Account"
        buttonColor="warning"
        isLightMode={isLightMode}
        reset={reset}
        getValues={getValues}
      >
        {(field, index) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Bank Name")}
              </label>
              <input
                type="text"
                {...register(`bank_accounts.${index}.bank_name`)}
                placeholder={t("Enter bank name")}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("Account Number")}
              </label>
              <input
                type="text"
                {...register(`bank_accounts.${index}.account_number`)}
                placeholder={t("Enter account number")}
                className={`w-full px-4 py-2 rounded-lg ${
                  isLightMode
                    ? "bg-white border border-gray-300"
                    : "bg-main border border-gray-600"
                } outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
          </div>
        )}
      </DynamicFieldArray>
    </div>
  );
};

export default CompensationSection;