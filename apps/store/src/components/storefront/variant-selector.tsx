'use client'

import { VariantSelector as VariantSelectorType } from 'tulumbak-shared'

export function VariantSelector({ options, selected, onSelect }: VariantSelectorType) {
  const handleChange = (kind: string, value: string | number) => {
    onSelect({
      ...selected,
      [kind]: value
    })
  }

  return (
    <div className="space-y-4">
      {options.map((option, index) => (
        <div key={index}>
          <h4 className="text-sm font-medium text-gray-700 mb-3 capitalize">
            {option.kind === 'weight' ? 'Ağırlık' : option.kind}
          </h4>
          <div 
            role="radiogroup" 
            aria-label={`${option.kind} seçimi`}
            className="flex flex-wrap gap-2"
          >
            {option.values.map((value, valueIndex) => (
              <label
                key={valueIndex}
                className={`
                  flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer transition-all
                  ${selected[option.kind] === value 
                    ? 'border-tulumbak-amber bg-tulumbak-amber/10 text-tulumbak-amber' 
                    : 'border-gray-300 hover:border-tulumbak-amber/50'
                  }
                `}
              >
                <input
                  type="radio"
                  name={option.kind}
                  value={value}
                  checked={selected[option.kind] === value}
                  onChange={() => handleChange(option.kind, value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">
                  {option.kind === 'weight' ? `${value}kg` : value}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
