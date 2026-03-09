import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'accent' | 'error';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
    const baseStyle = "inline-flex items-center px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase shadow-sm";

    const variants = {
        primary: "bg-primary text-white",
        accent: "bg-accent text-primary",
        error: "bg-red-100 text-red-800 border-red-200 border"
    };

    return (
        <span className={`${baseStyle} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
