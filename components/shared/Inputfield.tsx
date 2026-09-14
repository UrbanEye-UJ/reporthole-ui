import { InputHTMLAttributes, ReactNode, useState } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: ReactNode;
}

function EyeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        </svg>
    );
}

function EyeSlashIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    );
}

export default function InputField({ label, icon, required, type, ...props }: InputFieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                <span className="text-gray-400 flex-shrink-0">{icon}</span>
                <input
                    required={required}
                    type={isPassword && showPassword ? "text" : type}
                    {...props}
                    className="bg-transparent flex-1 text-gray-800 placeholder-gray-500 text-sm outline-none w-full"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                )}
            </div>
        </div>
    );
}