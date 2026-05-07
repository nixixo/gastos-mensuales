import { LuCircleDollarSign } from "react-icons/lu";

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = "Sin gastos este mes" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <LuCircleDollarSign size={32} className="text-tertiary opacity-40" />
      <p className="text-sm text-tertiary">{message}</p>
    </div>
  );
}
