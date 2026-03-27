import { LuCircleDollarSign } from "react-icons/lu";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <LuCircleDollarSign size={32} className="text-white/15" />
      <p className="text-sm text-white/30">Sin gastos este mes</p>
    </div>
  );
}
