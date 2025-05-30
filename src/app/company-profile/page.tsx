"use client";

import { useState, useEffect } from "react";
import { Building2, Upload, Save, Edit3, Mail, Globe, FileText, X } from "lucide-react";
import useLanguage from "@/hooks/useLanguage";
import GridContainer from "@/components/common/atoms/ui/GridContainer";
import useCustomQuery from "@/hooks/useCustomQuery";
import { useCreateMutation } from "@/hooks/useCreateMutation";
import { useRolePermissions } from "@/hooks/useCheckPermissions";
import Image from "next/image";
import FileUploadWithProgress from "@/components/common/atoms/ui/FileUploadWithProgress";
import { useMokkBar } from "@/components/Providers/Mokkbar";

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
    const { setSnackbarConfig } = useMokkBar();
    const isAdmin = useRolePermissions("admin");
    const isRTL = currentLanguage === "ar";

    // Get business types from enum
    const businessTypes = Object.values(BusinessType);

    // Helper function to ensure complete URL for images
    const normalizeImageUrl = (url?: string): string => {
        if (!url) return '';

        console.log('Original URL:', url);

        // If already complete URL, return as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            console.log('URL is already complete:', url);
            return url;
        }

        // Use the base URL from environment variable
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        let normalizedUrl = '';

        if (url.startsWith('/')) {
            normalizedUrl = `${baseUrl}${url}`;
        } else {
            normalizedUrl = `${baseUrl}/${url}`;
        }

        console.log('Normalized URL:', normalizedUrl);
        return normalizedUrl;
    };

    // Fetch company profile
    const { data: companyProfile } = useCustomQuery<CompanyProfile>({
        queryKey: ["company-profile"],
        url: "/company-profile",
        nestedData: true,
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

    const handleFileUpload = (field: keyof CompanyProfile, fileUrl: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: fileUrl
        }));
    };

    const handleFileUploadError = (error: string) => {
        setSnackbarConfig({
            open: true,
            message: error,
            severity: 'error'
        });
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

    // Helper function to open files in new tab
    const openFile = (fileUrl?: string) => {
        if (!fileUrl) return;
        const fullUrl = normalizeImageUrl(fileUrl);
        window.open(fullUrl, '_blank');
    };

    // Helper function to get file name from URL
    const getFileName = (fileUrl: string) => {
        return fileUrl.split('/').pop() || 'Unknown file';
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
                            <div className="bg-secondary rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-twhite flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-white" />
                                        </div>
                                        {t("Licenses & Certifications")}
                                    </h3>
                                    {isEditing && (
                                        <button
                                            onClick={() => {
                                                const newLicense: LicensesCertifications = {
                                                    name: "",
                                                    number: "",
                                                    issuingAuthority: "",
                                                    issueDate: "",
                                                    expiryDate: "",
                                                    documentUrl: ""
                                                };
                                                setFormData(prev => ({
                                                    ...prev,
                                                    licensesCertifications: [...(prev.licensesCertifications || []), newLicense]
                                                }));
                                            }}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            {t("Add License")}
                                        </button>
                                    )}
                                </div>

                                {formData.licensesCertifications && formData.licensesCertifications.length > 0 ? (
                                    <div className="space-y-4">
                                        {formData.licensesCertifications.map((license, index) => (
                                            <div key={index} className="p-4 bg-main rounded-xl border border-gray-600">
                                                {isEditing ? (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-twhite font-medium">License #{index + 1}</h4>
                                                            <button
                                                                onClick={() => {
                                                                    const newLicenses = formData.licensesCertifications?.filter((_, i) => i !== index) || [];
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        licensesCertifications: newLicenses
                                                                    }));
                                                                }}
                                                                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                                                                title="Remove license"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                                    {t("License Name")}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={license.name}
                                                                    onChange={(e) => {
                                                                        const newLicenses = [...(formData.licensesCertifications || [])];
                                                                        newLicenses[index] = { ...license, name: e.target.value };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            licensesCertifications: newLicenses
                                                                        }));
                                                                    }}
                                                                    className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                                                                    placeholder={t("Enter license name")}
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                                    {t("License Number")}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={license.number}
                                                                    onChange={(e) => {
                                                                        const newLicenses = [...(formData.licensesCertifications || [])];
                                                                        newLicenses[index] = { ...license, number: e.target.value };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            licensesCertifications: newLicenses
                                                                        }));
                                                                    }}
                                                                    className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                                                                    placeholder={t("Enter license number")}
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                                    {t("Issuing Authority")}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={license.issuingAuthority || ""}
                                                                    onChange={(e) => {
                                                                        const newLicenses = [...(formData.licensesCertifications || [])];
                                                                        newLicenses[index] = { ...license, issuingAuthority: e.target.value };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            licensesCertifications: newLicenses
                                                                        }));
                                                                    }}
                                                                    className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                                                                    placeholder={t("Enter issuing authority")}
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                                    {t("Issue Date")}
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    value={license.issueDate || ""}
                                                                    onChange={(e) => {
                                                                        const newLicenses = [...(formData.licensesCertifications || [])];
                                                                        newLicenses[index] = { ...license, issueDate: e.target.value };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            licensesCertifications: newLicenses
                                                                        }));
                                                                    }}
                                                                    className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                                    {t("Expiry Date")}
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    value={license.expiryDate || ""}
                                                                    onChange={(e) => {
                                                                        const newLicenses = [...(formData.licensesCertifications || [])];
                                                                        newLicenses[index] = { ...license, expiryDate: e.target.value };
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            licensesCertifications: newLicenses
                                                                        }));
                                                                    }}
                                                                    className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-twhite focus:border-blue-500 focus:outline-none"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Document Upload */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                                {t("License Document")}
                                                            </label>
                                                            {license.documentUrl && (
                                                                <div className="mb-3">
                                                                    <div
                                                                        className="inline-flex items-center gap-2 p-2 bg-secondary rounded-lg border border-gray-600 cursor-pointer hover:border-blue-400 transition-colors"
                                                                        onClick={() => openFile(license.documentUrl)}
                                                                        title="Click to view document"
                                                                    >
                                                                        <FileText className="w-4 h-4 text-purple-400" />
                                                                        <span className="text-twhite text-sm">{getFileName(license.documentUrl || "")}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <FileUploadWithProgress
                                                                onUploadComplete={(fileUrl) => {
                                                                    const newLicenses = [...(formData.licensesCertifications || [])];
                                                                    newLicenses[index] = { ...license, documentUrl: fileUrl };
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        licensesCertifications: newLicenses
                                                                    }));
                                                                }}
                                                                onUploadError={handleFileUploadError}
                                                                acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                                maxFileSize={10}
                                                                uploadPath="company/licenses"
                                                                currentFileUrl={license.documentUrl}
                                                                placeholder={t("Upload license document")}
                                                                disabled={false}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // View Mode
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-twhite font-medium">{license.name || t("Unnamed License")}</h4>
                                                            {license.documentUrl && (
                                                                <button
                                                                    onClick={() => openFile(license.documentUrl)}
                                                                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-2"
                                                                    title="View document"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                    {t("View")}
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-gray-400">{t("Number")}: </span>
                                                                <span className="text-twhite">{license.number || "N/A"}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400">{t("Authority")}: </span>
                                                                <span className="text-twhite">{license.issuingAuthority || "N/A"}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400">{t("Expires")}: </span>
                                                                <span className="text-twhite">{license.expiryDate || "N/A"}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-400 py-8">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="mb-4">{t("No licenses or certifications added yet")}</p>
                                        {isEditing && (
                                            <button
                                                onClick={() => {
                                                    const newLicense: LicensesCertifications = {
                                                        name: "",
                                                        number: "",
                                                        issuingAuthority: "",
                                                        issueDate: "",
                                                        expiryDate: "",
                                                        documentUrl: ""
                                                    };
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        licensesCertifications: [newLicense]
                                                    }));
                                                }}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                                            >
                                                <FileText className="w-4 h-4" />
                                                {t("Add First License")}
                                            </button>
                                        )}
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
                            <div className="bg-secondary rounded-xl p-4 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
                                            <Upload className="w-3 h-3 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-twhite">{t("Company Logo")}</h3>
                                    </div>

                                    {/* Logo Preview */}
                                    {formData.companyLogo ? (
                                        <div
                                            className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-gray-600 cursor-pointer hover:border-blue-400 transition-colors duration-300 shadow-md"
                                            onClick={() => formData.companyLogo && openFile(formData.companyLogo)}
                                            title="Click to view full size"
                                        >
                                            <Image
                                                src={normalizeImageUrl(formData.companyLogo)}
                                                alt="Company Logo"
                                                width={60}
                                                height={60}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    console.error('Image failed to load:', normalizeImageUrl(formData.companyLogo));
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                                onLoad={() => {
                                                    console.log('Image loaded successfully:', normalizeImageUrl(formData.companyLogo));
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
                                            <Building2 className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Upload Section - Separate row when editing */}
                                {isEditing && (
                                    <div className="mt-4 pt-4 border-t border-gray-600">
                                        <FileUploadWithProgress
                                            onUploadComplete={(fileUrl) => handleFileUpload("companyLogo", fileUrl)}
                                            onUploadError={handleFileUploadError}
                                            acceptedFileTypes=".png,.jpg,.jpeg,.gif,.svg,.webp"
                                            maxFileSize={5}
                                            uploadPath="company/logos"
                                            currentFileUrl={formData.companyLogo}
                                            placeholder={t("Upload logo")}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Other Documents */}
                            <div className="bg-secondary rounded-xl p-6 border border-gray-700">
                                <h3 className="text-lg font-bold text-twhite mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    {t("Other Documents")}
                                </h3>

                                <div className="space-y-6">
                                    {/* Organizational Structure */}
                                    <div className="p-6 bg-main rounded-xl border border-gray-600">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
                                                <FileText className="w-3 h-3 text-white" />
                                            </div>
                                            <h4 className="text-twhite font-medium">{t("Organizational Structure")}</h4>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4">
                                            {t("Upload organizational chart or structure document")}
                                        </p>

                                        {/* Show current file if exists */}
                                        {formData.organizationalStructureFile ? (
                                            <div className="mb-4">
                                                <div
                                                    className="group p-4 bg-secondary rounded-lg border border-gray-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/10 transition-all duration-300 cursor-pointer"
                                                    onClick={() => openFile(formData.organizationalStructureFile)}
                                                    title="Click to open file"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                                                                <FileText className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <span className="text-twhite text-sm font-medium block">
                                                                    {getFileName(formData.organizationalStructureFile)}
                                                                </span>
                                                                <span className="text-gray-400 text-xs">
                                                                    {t("Click to view document")}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                {t("Open")}
                                                            </div>
                                                            {isEditing && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleFileUpload("organizationalStructureFile", "");
                                                                    }}
                                                                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                                                                    title="Remove file"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-dashed border-gray-600 text-center">
                                                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-400 text-sm">{t("No organizational structure uploaded")}</p>
                                            </div>
                                        )}

                                        {isEditing && (
                                            <FileUploadWithProgress
                                                onUploadComplete={(fileUrl) => handleFileUpload("organizationalStructureFile", fileUrl)}
                                                onUploadError={handleFileUploadError}
                                                acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                                                maxFileSize={10}
                                                uploadPath="company/documents"
                                                currentFileUrl={formData.organizationalStructureFile}
                                                placeholder={t("Click to upload organizational structure")}
                                                disabled={!isEditing}
                                            />
                                        )}
                                    </div>

                                    {/* Terms & Conditions */}
                                    <div className="p-6 bg-main rounded-xl border border-gray-600">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
                                                <FileText className="w-3 h-3 text-white" />
                                            </div>
                                            <h4 className="text-twhite font-medium">{t("Terms & Conditions")}</h4>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4">
                                            {t("Upload terms and conditions documents")}
                                        </p>

                                        <div className="space-y-3">
                                            {formData.termsAndConditionsFiles && formData.termsAndConditionsFiles.length > 0 ? (
                                                <div className="space-y-3">
                                                    {formData.termsAndConditionsFiles.map((fileUrl, index) => (
                                                        <div
                                                            key={index}
                                                            className="group p-4 bg-secondary rounded-lg border border-gray-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/10 transition-all duration-300 cursor-pointer"
                                                            onClick={() => openFile(fileUrl)}
                                                            title="Click to open file"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                                                        <FileText className="w-5 h-5 text-white" />
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-twhite text-sm font-medium block">
                                                                            {getFileName(fileUrl)}
                                                                        </span>
                                                                        <span className="text-gray-400 text-xs">
                                                                            {t("Click to view document")}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                        {t("Open")}
                                                                    </div>
                                                                    {isEditing && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const newFiles = formData.termsAndConditionsFiles?.filter((_, i) => i !== index) || [];
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    termsAndConditionsFiles: newFiles
                                                                                }));
                                                                            }}
                                                                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                                                                            title="Remove file"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-6 bg-gray-800/50 rounded-lg border border-dashed border-gray-600 text-center">
                                                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-gray-400 text-sm">{t("No terms and conditions files uploaded")}</p>
                                                </div>
                                            )}

                                            {isEditing && (
                                                <div className="mt-4">
                                                    <FileUploadWithProgress
                                                        onUploadComplete={(fileUrl) => {
                                                            const newFiles = [...(formData.termsAndConditionsFiles || []), fileUrl];
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                termsAndConditionsFiles: newFiles
                                                            }));
                                                        }}
                                                        onUploadError={handleFileUploadError}
                                                        acceptedFileTypes=".pdf,.doc,.docx"
                                                        maxFileSize={10}
                                                        uploadPath="company/terms"
                                                        placeholder={t("Click to upload terms & conditions")}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            )}
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