export enum BusinessType {
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

export interface SocialMediaLinks {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
}

export interface LicensesCertifications {
    name: string;
    number: string;
    issuingAuthority?: string;
    issueDate?: string;
    expiryDate?: string;
    documentUrl?: string;
}

export interface CompanyProfile {
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