import { LuArrowLeft } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import { NameMappingManager } from '@/components/NameMappingManager';

interface SettingsPageProps {
  userId: string;
}

export function SettingsPage({ userId }: SettingsPageProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto px-4 py-8 gap-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Volver"
        >
          <LuArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white">Configuración</h1>
          <p className="text-xs text-white/40">Personaliza tu experiencia</p>
        </div>
      </div>

      {/* Content - Mappings Manager */}
      <div className="flex flex-col gap-4">
        <NameMappingManager userId={userId} />
      </div>
    </div>
  );
}
