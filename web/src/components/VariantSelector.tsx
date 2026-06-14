import React from 'react';
import type { Variant } from '../types';

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string | null) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({ variants, selectedVariantId, onSelect }) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="mb-12 flex justify-center">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 text-center">Customize your path</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => onSelect(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedVariantId === null
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Full Roadmap
          </button>
          
          {variants.map(variant => (
            <button
              key={variant.id}
              onClick={() => onSelect(variant.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedVariantId === variant.id
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={variant.description}
            >
              {variant.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
