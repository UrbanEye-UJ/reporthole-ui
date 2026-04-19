import { InputHTMLAttributes, ReactNode } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: ReactNode;
}

export default function InputField({ label, icon, ...props }: InputFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">{label}</label>
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                <span className="text-gray-400 flex-shrink-0">{icon}</span>
                <input
                    {...props}
                    className="bg-transparent flex-1 text-gray-800 placeholder-gray-400 text-sm outline-none w-full"
                />
            </div>
        </div>
    );
}