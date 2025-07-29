'use client'

import { cn } from '@/lib/utils'

// Color variants for the StatCard component
const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    valueText: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    valueText: 'text-green-600',
  },
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    valueText: 'text-red-600',
  },
  gray: {
    bg: 'bg-gray-50',
    iconBg: 'bg-gray-200',
    iconText: 'text-gray-600',
    valueText: 'text-gray-800',
  },
}

/**
 * A reusable card component for displaying key statistics.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the statistic.
 * @param {string|number} props.value - The value of the statistic.
 * @param {React.ElementType} props.icon - The icon component to display.
 * @param {'blue'|'green'|'red'|'gray'} [props.color='gray'] - The color theme of the card.
 */
export function StatCard({ title, value, icon: Icon, color = 'gray' }) {
  const variants = colorVariants[color]

  return (
    <div className={cn('rounded-xl border border-gray-200 p-5 shadow-sm', variants.bg)}>
      <div className="flex items-center gap-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', variants.iconBg)}>
          <Icon className={cn('h-5 w-5', variants.iconText)} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={cn('text-2xl font-bold', variants.valueText)}>{value}</p>
        </div>
      </div>
    </div>
  )
}
