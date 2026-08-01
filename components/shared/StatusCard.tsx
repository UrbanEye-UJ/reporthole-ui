interface StatusCardProps {
    label: string;
    value: string;
}

export default function StatusCard({ label, value }: StatusCardProps) {
    return (
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-1 shadow-sm transition-colors duration-300">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        </div>
    );
}
