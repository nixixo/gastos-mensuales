import { LuCircleDollarSign } from "react-icons/lu";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <LuCircleDollarSign size={32} className="text-tertiary opacity-40" />
      <p className="text-sm text-tertiary">Sin gastos este mes</p>
    </div>
  );
}
