interface StatusCardProps {
    label: string;
    value: string;
}

export default function StatusCard({ label, value }: StatusCardProps) {
    return (
        <div className="flex-1 bg-white rounded-xl p-4 flex flex-col items-center gap-1 shadow-sm">
            <span className="text-2xl font-bold text-blue-600">{value}</span>
            <span className="text-xs text-gray-500">{label}</span>
        </div>
    );
}
