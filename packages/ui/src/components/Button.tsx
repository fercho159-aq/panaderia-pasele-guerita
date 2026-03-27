import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'accent' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, children, ...props }) => {
    const baseStyles = "relative inline-flex items-center justify-center px-8 py-3 rounded-full font-serif font-bold transition-all duration-300 transform hover:-translate-y-1 active:scale-95 shadow-md hover:shadow-xl";
    const variants = {
        primary: "bg-primary text-white hover:bg-primary-dark border-2 border-primary hover:border-accent",
        accent: "bg-accent text-white hover:bg-accent-dark border-2 border-accent hover:border-primary",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-md`}
            {...props}
        >
            {children}
        </button>
    );
};
