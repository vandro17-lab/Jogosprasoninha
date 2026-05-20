'use client'

import { motion } from 'framer-motion'

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
  { value: 'nora',     label: 'Nora' },
  { value: 'genro',    label: 'Genro' },
  { value: 'outro',    label: 'Outro' },
]

interface RelationSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function RelationSelector({ value, onChange }: RelationSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {RELATIONS.map((rel) => {
        const selected = value === rel.value
        return (
          <motion.button
            key={rel.value}
            type="button"
            onClick={() => onChange(rel.value)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              padding: '6px 16px',
              borderRadius: 9999,
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: selected
                ? 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)'
                : '#F0E8D8',
              color: selected ? '#fff' : '#3D3228',
              boxShadow: selected ? '0 3px 12px rgba(201,168,76,0.40)' : 'none',
              transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
            }}
          >
            {rel.label}
          </motion.button>
        )
      })}
    </div>
  )
}
