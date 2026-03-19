import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'accent' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, children, ...props }) => {
    const baseStyles = "px-6 py-2 rounded-full font-serif font-bold transition-all duration-200 transform hover:scale-105 active:scale-95";
    const variants = {
        primary: "bg-primary text-white hover:bg-opacity-90",
        accent: "bg-accent text-white hover:bg-opacity-90",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100`}
            {...props}
        >
            {children}
        </button>
    );
};
