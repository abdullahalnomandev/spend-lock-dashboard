import type { LockStatus } from './usersData'
import { lockStatusLabels } from './usersData'

const styles: Record<LockStatus, string> = {
  unlocked: 'bg-gray-100 text-gray-700 ring-gray-200',
  locked: 'bg-brand/10 text-brand ring-brand/20',
  breached: 'bg-red-100 text-red-700 ring-red-200',
}

const dots: Record<LockStatus, string> = {
  unlocked: 'bg-gray-400',
  locked: 'bg-brand',
  breached: 'bg-red-500',
}

export default function LockStatusBadge({ status }: { status: LockStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {lockStatusLabels[status]}
    </span>
  )
}
