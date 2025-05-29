"use client";

import { useState, useEffect } from "react";
import { Building2, Settings, Info, Upload, Save, Edit3 } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";
import useCustomTheme from "@/hooks/useCustomTheme";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import useCustomQuery from "@/hooks/useCustomQuery";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useRolePermissions } from "@/hooks/useCheckPermissions";

// Business Types Enum
enum BusinessType {
    TECHNOLOGY = 'Technology',
    HEALTHCARE = 'Healthcare',
    RETAIL = 'Retail',
    MANUFACTURING = 'Manufacturing',
    EDUCATION = 'Education',
    FINANCE = 'Finance',
    REAL_ESTATE = 'Real Estate',
    LOGISTICS = 'Logistics',
    HOSPITALITY = 'Hospitality',
    TELECOMMUNICATIONS = 'Telecommunications',
    ENERGY = 'Energy',
    CONSULTING = 'Consulting',
    MARKETING = 'Marketing',
    TRANSPORTATION = 'Transportation',
    PHARMACEUTICALS = 'Pharmaceuticals',
    AGRICULTURE = 'Agriculture',
    ENTERTAINMENT = 'Entertainment',
    NON_PROFIT = 'Non-profit',
    GOVERNMENT = 'Government',
    E_COMMERCE = 'E-commerce'
}

interface CompanyProfile {
    _id?: string;
    companyName: string;
    companyLogo?: string;
    commercialRegistrationNumber: string;
    establishmentDate: string;
    businessType: string;
    companyDescription: string;
    officialEmail: string;
    phoneNumber: string;
    companyAddress: string;
    locationMapUrl?: string;
    socialMediaLinks?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        website?: string;
    };
    taxNumber: string;
    licensesCertifications?: Array<{
        name: string;
        number: string;
        issuingAuthority?: string;
        issueDate?: string;
        expiryDate?: string;
        documentUrl?: string;
    }>;
    termsAndConditionsFiles?: string[];
    ceoName: string;
    organizationalStructureFile?: string;
    isSetupCompleted?: boolean;
}

const CompanySettings = () => {
    const [activeTab, setActiveTab] = useState("info");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<CompanyProfile>({
        companyName: "",
        commercialRegistrationNumber: "",
        establishmentDate: "",
        businessType: "",
        companyDescription: "",
        officialEmail: "",
        phoneNumber: "",
        companyAddress: "",
        taxNumber: "",
        ceoName: "",
    });

    const { t, currentLanguage } = useLanguage();
    const { isLightMode } = useCustomTheme();
    const isAdmin = useRolePermissions("admin");
    const isRTL = currentLanguage === "ar";

    // Get business types from enum
    const businessTypes = Object.values(BusinessType);

    // Fetch company profile
    const { data: companyProfile, isLoading, refetch } = useCustomQuery<CompanyProfile>({
        queryKey: ["company-profile"],
        url: "/company-profile",
    });

    // Update company profile mutation
    const { mutate: updateProfile, isPending: isUpdating } = useCreateMutation({
        endpoint: "/company-profile",
        onSuccessMessage: "Company profile updated successfully!",
        invalidateQueryKeys: ["company-profile"],
        requestType: "put",
    });

    // Create company profile mutation
    const { mutate: createProfile, isPending: isCreating } = useCreateMutation({
        endpoint: "/company-profile",
        onSuccessMessage: "Company profile created successfully!",
        invalidateQueryKeys: ["company-profile"],
        requestType: "post",
    });

    // Initialize form data when company profile is loaded
    useEffect(() => {
        if (companyProfile) {
            setFormData(companyProfile);
        }
    }, [companyProfile]);

    const handleInputChange = (field: keyof CompanyProfile, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSocialMediaChange = (platform: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialMediaLinks: {
                ...prev.socialMediaLinks,
                [platform]: value
            }
        }));
    };

    const handleSave = () => {
        if (companyProfile?._id) {
            updateProfile(formData);
        } else {
            createProfile(formData);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (companyProfile) {
            setFormData(companyProfile);
        }
        setIsEditing(false);
    };

    if (!isAdmin) {
        return (
            <GridContainer>
                <div className="col-span-full min-h-screen bg-main flex items-center justify-center">
                    <div className="text-center">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h2 className="text-xl font-bold text-twhite mb-2">{t("Access Denied")}</h2>
                        <p className="text-gray-400">{t("You don't have permission to access company settings")}</p>
                    </div>
                </div>
            </GridContainer>
        );
    }

    return (
        <GridContainer>
            <div className={`col-span-full min-h-screen bg-main ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="max-w-7xl mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="bg-secondary rounded-2xl shadow-xl p-6 mb-6">
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-twhite">{t("Company Settings")}</h1>
                                    <p className="text-gray-400">{t("Manage your company profile and settings")}</p>
                                </div>
                            </div>

                            {activeTab === "info" && (
                                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                disabled={isUpdating || isCreating}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4" />
                                                {isUpdating || isCreating ? t("Saving...") : t("Save")}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                {t("Cancel")}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            {t("Edit")}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-secondary rounded-xl shadow-lg p-2 mb-6">
                        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {[
                                { id: "info", icon: Info, label: "Company Info" },
                                { id: "settings", icon: Settings, label: "Settings" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg transition-all duration-300 ${activeTab === tab.id
                                        ? "bg-tblack text-twhite shadow-lg transform scale-105"
                                        : "text-gray-400 hover:text-twhite hover:bg-dark"
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span className="font-medium">{t(tab.label)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "info" && (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-400" />
                                    {t("Basic Information")}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Company Name")}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.companyName}
                                            onChange={(e) => handleInputChange("companyName", e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            placeholder={t("Enter company name")}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Commercial Registration Number")}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.commercialRegistrationNumber}
                                            onChange={(e) => handleInputChange("commercialRegistrationNumber", e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            placeholder={t("Enter registration number")}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Establishment Date")}
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.establishmentDate}
                                            onChange={(e) => handleInputChange("establishmentDate", e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Business Type")}
                                        </label>
                                        <select
                                            value={formData.businessType}
                                            onChange={(e) => handleInputChange("businessType", e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                        >
                                            <option value="">{t("Select business type")}</option>
                                            {businessTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Company Description")}
                                        </label>
                                        <textarea
                                            value={formData.companyDescription}
                                            onChange={(e) => handleInputChange("companyDescription", e.target.value)}
                                            disabled={!isEditing}
                                            rows={3}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            placeholder={t("Enter company description")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-green-400" />
                                    {t("Contact Information")}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Official Email")}
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.officialEmail}
                                            onChange={(e) => handleInputChange("officialEmail", e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            placeholder={t("Enter official email")}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Phone Number")}
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            placeholder={t("Enter phone number")}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Company Address")}
                                        </label>
                                        <textarea
                                            value={formData.companyAddress}
                                            onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                                            disabled={!isEditing}
                                            rows={2}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            placeholder={t("Enter company address")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Social Media Links */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-purple-400" />
                                    {t("Social Media Links")}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {["facebook", "twitter", "linkedin", "instagram", "website"].map((platform) => (
                                        <div key={platform}>
                                            <label className="block text-sm font-medium text-gray-400 mb-2 capitalize">
                                                {platform}
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.socialMediaLinks?.[platform as keyof typeof formData.socialMediaLinks] || ""}
                                                onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                                placeholder={`Enter ${platform} URL`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Legal Information */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-yellow-400" />
                                    {t("Legal Information")}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Tax Number")}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.taxNumber}
                                            onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            placeholder={t("Enter tax number")}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("CEO Name")}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.ceoName}
                                            onChange={(e) => handleInputChange("ceoName", e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            placeholder={t("Enter CEO name")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="space-y-6">
                            {/* System Settings */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-blue-400" />
                                    {t("System Settings")}
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                                        <div>
                                            <h4 className="text-twhite font-medium">{t("Setup Status")}</h4>
                                            <p className="text-gray-400 text-sm">{t("Company setup completion status")}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${companyProfile?.isSetupCompleted
                                            ? "bg-green-600 text-white"
                                            : "bg-yellow-600 text-white"
                                            }`}>
                                            {companyProfile?.isSetupCompleted ? t("Completed") : t("Pending")}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-main rounded-lg">
                                        <div>
                                            <h4 className="text-twhite font-medium">{t("Company Logo")}</h4>
                                            <p className="text-gray-400 text-sm">{t("Upload and manage company logo")}</p>
                                        </div>
                                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                            <Upload className="w-4 h-4" />
                                            {t("Upload Logo")}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Licenses & Certifications */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-green-400" />
                                    {t("Licenses & Certifications")}
                                </h3>

                                <div className="text-center text-gray-400 py-8">
                                    <p>{t("No licenses or certifications added yet")}</p>
                                    <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                                        {t("Add License")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GridContainer>
    );
};

export default CompanySettings; 