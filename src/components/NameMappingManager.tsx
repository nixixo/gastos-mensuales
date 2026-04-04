'use client';

import { useEffect, useState, useCallback } from 'react';
import { LuX, LuPlus } from 'react-icons/lu';
import { ICON_MAP } from '@/lib/icon-map';
import type { NameMapping } from '@/lib/types';
import { getUserNameMappings, addNameMapping, deleteNameMapping } from '@/lib/db';

interface NameMappingManagerProps {
  userId: string;
}

export function NameMappingManager({ userId }: NameMappingManagerProps) {
  const [mappings, setMappings] = useState<NameMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const loadMappings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserNameMappings(userId);
      setMappings(data);
    } catch (e) {
      console.error('Error loading mappings:', e);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  const handleAddMapping = async () => {
    if (!customName.trim() || !selectedIcon) return;

    setSubmitting(true);
    try {
      const newMapping: NameMapping = {
        id: crypto.randomUUID(),
        userId,
        customName: customName.trim(),
        iconKey: selectedIcon,
        createdAt: Date.now(),
      };
      await addNameMapping(newMapping);
      setMappings((prev) => [newMapping, ...prev]);
      setCustomName('');
      setSelectedIcon('');
      setShowForm(false);
    } catch (e) {
      console.error('Error adding mapping:', e);
    }
    setSubmitting(false);
  };

  const handleDeleteMapping = async (id: string) => {
    try {
      await deleteNameMapping(id);
      setMappings((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error('Error deleting mapping:', e);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Mis Mappings</h3>
          <p className="text-xs text-white/40 mt-0.5">Crea alias personalizados para tus gastos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Agregar mapping"
        >
          <LuPlus size={18} />
        </button>
      </div>

      {/* Form - Add new mapping */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
          {/* Custom Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider">
              Nombre personalizado
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Ej: LaMom, Netflix Fam"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-white/30 text-white placeholder:text-white/20"
              autoFocus
            />
          </div>

          {/* Icon Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/40 uppercase tracking-wider">
              Selecciona ícono
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-56 overflow-y-auto pb-1">
              {Object.entries(ICON_MAP)
                .filter(([, entry]) => entry.category === 'general')
                .map(([key, entry]) => {
                  const Icon = entry.icon;
                  const isSelected = selectedIcon === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedIcon(key)}
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-white/20 border border-white/40'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      title={entry.label}
                      type="button"
                    >
                      <Icon size={18} className="mx-auto" />
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleAddMapping}
              disabled={!customName.trim() || !selectedIcon || submitting}
              className="flex-1 bg-white text-black text-xs font-semibold py-2.5 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setCustomName('');
                setSelectedIcon('');
              }}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Mappings List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : mappings.length === 0 ? (
        <div className="text-center py-8 px-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xs text-white/40">
            {showForm ? 'Crea el primer mapping' : 'Sin mappings aún. Haz clic en + para agregar uno'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {mappings.map((mapping) => {
            const iconEntry = ICON_MAP[mapping.iconKey];
            const Icon = iconEntry?.icon;
            return (
              <div
                key={mapping.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {Icon && (
                    <Icon
                      size={16}
                      className="shrink-0 text-white/60"
                      style={
                        iconEntry.color && iconEntry.category === 'brand'
                          ? { color: iconEntry.color }
                          : undefined
                      }
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{mapping.customName}</p>
                    <p className="text-xs text-white/40">{iconEntry?.label}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMapping(mapping.id)}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors ml-2 shrink-0"
                  title="Eliminar"
                  type="button"
                >
                  <LuX size={14} className="text-white/40 hover:text-white/60" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
