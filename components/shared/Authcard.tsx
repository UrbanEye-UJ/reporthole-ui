import { ReactNode } from "react";

interface AuthCardProps {
    children: ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
    return (
        <main className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-12">
            <div className="bg-white rounded-3xl shadow-sm w-full max-w-md px-8 py-10 flex flex-col items-center gap-6">
                {children}
            </div>
        </main>
    );
}