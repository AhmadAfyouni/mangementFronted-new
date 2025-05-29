"use client";

import { useState, useEffect } from "react";
import { Building2, Info, Upload, Save, Edit3, MapPin, Mail, Phone, Globe, FileText, User, Calendar, Hash } from "lucide-react";
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

interface SocialMediaLinks {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
}

interface LicensesCertifications {
    name: string;
    number: string;
    issuingAuthority?: string;
    issueDate?: string;
    expiryDate?: string;
    documentUrl?: string;
}

interface CompanyProfile {
    _id?: string;
    companyName: string;
    companyLogo?: string;
    commercialRegistrationNumber: string;
    establishmentDate: string;
    businessType: BusinessType;
    companyDescription: string;
    officialEmail: string;
    phoneNumber: string;
    companyAddress: string;
    locationMapUrl?: string;
    socialMediaLinks?: SocialMediaLinks;
    taxNumber: string;
    licensesCertifications?: LicensesCertifications[];
    termsAndConditionsFiles?: string[];
    ceoName: string;
    organizationalStructureFile?: string;
    isSetupCompleted?: boolean;
}

const CompanyProfile = () => {
    const [activeTab, setActiveTab] = useState("basic");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<CompanyProfile>({
        companyName: "",
        commercialRegistrationNumber: "",
        establishmentDate: "",
        businessType: BusinessType.TECHNOLOGY,
        companyDescription: "",
        officialEmail: "",
        phoneNumber: "",
        companyAddress: "",
        taxNumber: "",
        ceoName: "",
        socialMediaLinks: {
            facebook: "",
            twitter: "",
            linkedin: "",
            instagram: "",
            website: ""
        },
        licensesCertifications: [],
        termsAndConditionsFiles: []
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

    // Complete setup mutation
    const { mutate: completeSetup, isPending: isCompletingSetup } = useCreateMutation({
        endpoint: "/company-profile/complete-setup",
        onSuccessMessage: "Company setup completed successfully!",
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

    const handleCompleteSetup = () => {
        completeSetup({});
    };

    if (!isAdmin) {
        return (
            <GridContainer>
                <div className="col-span-full min-h-screen bg-main flex items-center justify-center">
                    <div className="text-center">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h2 className="text-xl font-bold text-twhite mb-2">{t("Access Denied")}</h2>
                        <p className="text-gray-400">{t("You don't have permission to access company profile")}</p>
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
                                    <h1 className="text-2xl font-bold text-twhite">{t("Company Profile")}</h1>
                                    <p className="text-gray-400">{t("Manage your company profile and information")}</p>
                                </div>
                            </div>

                            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {!companyProfile?.isSetupCompleted && companyProfile && (
                                    <button
                                        onClick={handleCompleteSetup}
                                        disabled={isCompletingSetup}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isCompletingSetup ? t("Completing...") : t("Complete Setup")}
                                    </button>
                                )}

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
                        </div>

                        {/* Setup Status */}
                        {companyProfile && (
                            <div className="mt-4 p-3 rounded-lg bg-main">
                                <div className="flex items-center justify-between">
                                    <span className="text-twhite font-medium">{t("Setup Status")}</span>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${companyProfile.isSetupCompleted
                                        ? "bg-green-600 text-white"
                                        : "bg-yellow-600 text-white"
                                        }`}>
                                        {companyProfile.isSetupCompleted ? t("Completed") : t("Pending")}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="bg-secondary rounded-xl shadow-lg p-2 mb-6">
                        <div className={`flex gap-2 overflow-x-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {[
                                { id: "basic", icon: Building2, label: "Basic Info" },
                                { id: "contact", icon: Mail, label: "Contact & Location" },
                                { id: "legal", icon: FileText, label: "Legal & Financial" },
                                { id: "social", icon: Globe, label: "Social Media" },
                                { id: "documents", icon: Upload, label: "Documents" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                        ? "bg-tblack text-twhite shadow-lg transform scale-105"
                                        : "text-gray-400 hover:text-twhite hover:bg-dark"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="font-medium text-sm">{t(tab.label)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "basic" && (
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

                    {activeTab === "contact" && (
                        <div className="space-y-6">
                            {/* Contact Information */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-green-400" />
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

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            {t("Location Map URL")}
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.locationMapUrl || ""}
                                            onChange={(e) => handleInputChange("locationMapUrl", e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                            placeholder={t("Enter Google Maps or location URL")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "legal" && (
                        <div className="space-y-6">
                            {/* Legal Information */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-yellow-400" />
                                    {t("Legal & Financial Information")}
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
                                </div>
                            </div>

                            {/* Licenses & Certifications */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-purple-400" />
                                    {t("Licenses & Certifications")}
                                </h3>

                                {formData.licensesCertifications && formData.licensesCertifications.length > 0 ? (
                                    <div className="space-y-3">
                                        {formData.licensesCertifications.map((license, index) => (
                                            <div key={index} className="p-4 bg-main rounded-lg">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                    <div>
                                                        <span className="text-sm text-gray-400">{t("Name")}</span>
                                                        <p className="text-twhite font-medium">{license.name}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm text-gray-400">{t("Number")}</span>
                                                        <p className="text-twhite font-medium">{license.number}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm text-gray-400">{t("Issuing Authority")}</span>
                                                        <p className="text-twhite font-medium">{license.issuingAuthority || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-400 py-8">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>{t("No licenses or certifications added yet")}</p>
                                        <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                                            {t("Add License")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "social" && (
                        <div className="space-y-6">
                            {/* Social Media Links */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-blue-400" />
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
                                                value={formData.socialMediaLinks?.[platform as keyof SocialMediaLinks] || ""}
                                                onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full bg-main border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                                placeholder={`Enter ${platform} URL`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "documents" && (
                        <div className="space-y-6">
                            {/* Company Logo */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-blue-400" />
                                    {t("Company Logo")}
                                </h3>

                                <div className="flex items-center gap-4">
                                    {formData.companyLogo ? (
                                        <div className="w-20 h-20 rounded-lg bg-main flex items-center justify-center overflow-hidden">
                                            <img
                                                src={formData.companyLogo}
                                                alt="Company Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-lg bg-main flex items-center justify-center">
                                            <Building2 className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <p className="text-twhite font-medium mb-2">
                                            {formData.companyLogo ? t("Logo uploaded") : t("No logo uploaded")}
                                        </p>
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                            {t("Upload Logo")}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Other Documents */}
                            <div className="bg-secondary rounded-xl p-6">
                                <h3 className="text-lg font-bold text-twhite mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-green-400" />
                                    {t("Other Documents")}
                                </h3>

                                <div className="space-y-4">
                                    <div className="p-4 bg-main rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-twhite font-medium">{t("Organizational Structure")}</h4>
                                                <p className="text-gray-400 text-sm">{t("Upload organizational chart or structure document")}</p>
                                            </div>
                                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                                                {t("Upload")}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-main rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-twhite font-medium">{t("Terms & Conditions")}</h4>
                                                <p className="text-gray-400 text-sm">{t("Upload terms and conditions documents")}</p>
                                            </div>
                                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                                                {t("Upload")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GridContainer>
    );
};

export default CompanyProfile; 