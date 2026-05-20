'use client'

const RELATIONS = [
  { value: 'amiga',    label: 'Amiga' },
  { value: 'amigo',    label: 'Amigo' },
  { value: 'irmã',     label: 'Irmã' },
  { value: 'irmão',    label: 'Irmão' },
  { value: 'sobrinha', label: 'Sobrinha' },
  { value: 'sobrinho', label: 'Sobrinho' },
  { value: 'prima',    label: 'Prima' },
  { value: 'primo',    label: 'Primo' },
  { value: 'pastora',  label: 'Pastora' },
  { value: 'filha',    label: 'Filha' },
  { value: 'filho',    label: 'Filho' },
  { value: 'outro',    label: 'Outro' },
]

interface RelationSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function RelationSelector({ value, onChange }: RelationSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {RELATIONS.map((rel) => (
        <button
          key={rel.value}
          type="button"
          onClick={() => onChange(rel.value)}
          className={`
            py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200
            ${value === rel.value
              ? 'bg-gold text-white shadow-md'
              : 'bg-beige text-text-dark hover:bg-gold-light'
            }
          `}
        >
          {rel.label}
        </button>
      ))}
    </div>
  )
}
