import type React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

const Button = ({ children, type = 'button', ...rest }: ButtonProps): React.ReactElement => {
    return (
        <button type={type} {...rest}>
            {children}
        </button>
    );
};

export default Button;
