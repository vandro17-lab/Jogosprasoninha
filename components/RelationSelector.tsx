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
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="focus-ring"
            style={{
              padding: '8px 18px',
              borderRadius: 9999,
              border: selected
                ? '1px solid rgba(160, 120, 48, 0.45)'
                : '1px solid rgba(232, 213, 163, 0.55)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: selected
                ? 'linear-gradient(180deg, #D9B95C 0%, #C9A84C 55%, #A07830 100%)'
                : 'linear-gradient(180deg, #FBF6E8 0%, #F0E8D8 100%)',
              color: selected ? '#fff' : '#5A4530',
              boxShadow: selected
                ? '0 1px 0 rgba(255,255,255,0.45) inset, 0 -2px 4px rgba(160,120,48,0.20) inset, 0 6px 18px rgba(201,168,76,0.40), 0 0 0 1px rgba(232,213,163,0.6)'
                : '0 1px 0 rgba(255,255,255,0.7) inset, 0 1px 2px rgba(61,50,40,0.04), 0 4px 10px -4px rgba(61,50,40,0.06)',
              transition: 'background 0.3s var(--ease-luxe), color 0.25s ease, box-shadow 0.3s var(--ease-luxe), border-color 0.25s ease',
              letterSpacing: '0.01em',
            }}
          >
            {rel.label}
          </motion.button>
        )
      })}
    </div>
  )
}
