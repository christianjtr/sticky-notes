import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

const Button = ({ onClick, children, className = '', type = 'button', ...rest }: ButtonProps): React.ReactElement => {
    return (
        <button
            type={type}
            className={className}
            onClick={onClick}
            {...rest}
        >
            {children}
        </button>
    )
}

export default Button
