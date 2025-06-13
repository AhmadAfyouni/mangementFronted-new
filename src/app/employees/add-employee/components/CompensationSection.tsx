/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, DollarSign, Gift, Banknote, Hash } from "lucide-react";

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
  reset,
  getValues,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-lg mb-6 border bg-dark border-gray-700">

      {/* Allowances Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-yellow-400/60" />
          <h3 className="text-md font-semibold text-yellow-400/60 ">{t("Allowances")}</h3>
        </div>
        {allowancesFields.length === 0 ? (
          <div className="text-center py-6 text-gray-400">{t("No allowances added yet")}</div>
        ) : (
          <div className="space-y-4">
            {allowancesFields.map((field, index) => (
              <div key={field.id} className="p-4 rounded-lg bg-dark border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Allowance Type */}
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-yellow-400/60" />
                      {t("Allowance Type")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register(`allowances.${index}.allowance_type`)}
                        placeholder={t("Enter allowance type")}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-yellow-500 focus:ring focus:ring-yellow-500/20 focus:outline-none transition-colors"
                      />
                      {errors.allowances?.[index]?.allowance_type && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.allowances?.[index]?.allowance_type && (
                      <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.allowances[index].allowance_type.message}
                      </p>
                    )}
                  </div>
                  {/* Amount */}
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-yellow-400/60" />
                      {t("Amount")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        {...register(`allowances.${index}.amount`)}
                        placeholder={t("Enter amount")}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-yellow-500 focus:ring focus:ring-yellow-500/20 focus:outline-none transition-colors"
                      />
                      {errors.allowances?.[index]?.amount && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.allowances?.[index]?.amount && (
                      <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.allowances[index].amount.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={() => { removeAllowance(index); reset(getValues()); }} className="text-red-400 hover:underline text-sm flex items-center gap-1">
                    {t("Remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button type="button" onClick={() => appendAllowance({ allowance_type: "", amount: 0 })} className="flex items-center gap-1 text-yellow-400/60 hover:underline">
            <DollarSign className="w-4 h-4" /> {t("Add Allowance")}
          </button>
        </div>
      </div>

      {/* Incentives Section */}
      <div className="mb-4 mt-8">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-5 h-5 text-yellow-400/60" />
          <h3 className="text-md font-semibold text-yellow-400/60">{t("Incentives")}</h3>
        </div>
        {incentivesFields.length === 0 ? (
          <div className="text-center py-6 text-gray-400">{t("No incentives added yet")}</div>
        ) : (
          <div className="space-y-4">
            {incentivesFields.map((field, index) => (
              <div key={field.id} className="p-4 rounded-lg bg-dark border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-yellow-400/60" />
                      {t("Description")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register(`incentives.${index}.description`)}
                        placeholder={t("Enter description")}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-yellow-500 focus:ring focus:ring-yellow-500/20 focus:outline-none transition-colors"
                      />
                      {errors.incentives?.[index]?.description && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.incentives?.[index]?.description && (
                      <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.incentives[index].description.message}
                      </p>
                    )}
                  </div>
                  {/* Amount */}
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-yellow-400/60" />
                      {t("Amount")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        {...register(`incentives.${index}.amount`)}
                        placeholder={t("Enter amount")}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-yellow-500 focus:ring focus:ring-yellow-500/20 focus:outline-none transition-colors"
                      />
                      {errors.incentives?.[index]?.amount && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.incentives?.[index]?.amount && (
                      <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.incentives[index].amount.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={() => { removeIncentive(index); reset(getValues()); }} className="text-red-400 hover:underline text-sm flex items-center gap-1">
                    {t("Remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button type="button" onClick={() => appendIncentive({ description: "", amount: 0 })} className="flex items-center gap-1 text-yellow-400/60 hover:underline">
            <Gift className="w-4 h-4" /> {t("Add Incentive")}
          </button>
        </div>
      </div>

      {/* Bank Accounts Section */}
      <div className="mb-4 mt-8">
        <div className="flex items-center gap-2 mb-2">
          <Banknote className="w-5 h-5 text-yellow-400/60" />
          <h3 className="text-md font-semibold text-yellow-400/60">{t("Bank Accounts")}</h3>
        </div>
        {bankAccountsFields.length === 0 ? (
          <div className="text-center py-6 text-gray-400">{t("No bank accounts added yet")}</div>
        ) : (
          <div className="space-y-4">
            {bankAccountsFields.map((field, index) => (
              <div key={field.id} className="p-4 rounded-lg bg-dark border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bank Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-yellow-400/60" />
                      {t("Bank Name")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register(`bank_accounts.${index}.bank_name`)}
                        placeholder={t("Enter bank name")}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-yellow-500 focus:ring focus:ring-yellow-500/20 focus:outline-none transition-colors"
                      />
                      {errors.bank_accounts?.[index]?.bank_name && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.bank_accounts?.[index]?.bank_name && (
                      <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.bank_accounts[index].bank_name.message}
                      </p>
                    )}
                  </div>
                  {/* Account Number */}
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-yellow-400/60" />
                      {t("Account Number")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register(`bank_accounts.${index}.account_number`)}
                        placeholder={t("Enter account number")}
                        className="w-full px-4 py-3.5 rounded-lg bg-dark text-twhite border border-gray-700 focus:border-yellow-500 focus:ring focus:ring-yellow-500/20 focus:outline-none transition-colors"
                      />
                      {errors.bank_accounts?.[index]?.account_number && (
                        <div className="absolute right-3 top-3.5 text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {errors.bank_accounts?.[index]?.account_number && (
                      <p className="text-red-400 mt-1.5 text-sm flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.bank_accounts[index].account_number.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={() => { removeBankAccount(index); reset(getValues()); }} className="text-red-400 hover:underline text-sm flex items-center gap-1">
                    {t("Remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button type="button" onClick={() => appendBankAccount({ bank_name: "", account_number: "" })} className="flex items-center gap-1 text-yellow-400/60 hover:underline">
            <Banknote className="w-4 h-4" /> {t("Add Bank Account")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompensationSection;