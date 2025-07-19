import React from "react";

interface FormLabelProps {
    children: React.ReactNode;
    required?: boolean;
    className?: string;
}

const FormLabel: React.FC<FormLabelProps> = ({
    children,
    required = false,
    className = ""
}) => {
    return (
        <label className={`block text-tmid text-sm font-medium ${className}`}>
            {children}
            {required && <span className="text-red-400"> *</span>}
        </label>
    );
};

export default FormLabel; 