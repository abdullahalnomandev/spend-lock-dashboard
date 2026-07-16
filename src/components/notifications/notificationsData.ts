export type NotificationCategory =
  | 'user'
  | 'support'
  | 'broadcast'
  | 'admin'

export type NotificationTone = 'info' | 'success' | 'warning' | 'danger'

export type Notification = {
  id: string
  category: NotificationCategory
  tone: NotificationTone
  title: string
  description: string
  linkTo: string
  createdAt: string
  read: boolean
}

export const categoryLabels: Record<NotificationCategory, string> = {
  user: 'Users',
  support: 'Support',
  broadcast: 'Broadcast',
  admin: 'Admins',
}

export const initialNotifications: Notification[] = [
  {
    id: 'n_010',
    category: 'support',
    tone: 'danger',
    title: 'Urgent ticket opened',
    description:
      'Sofía Ramírez · TKT-2042 · Charged twice for the Starter coin pack',
    linkTo: '/dashboard/support/TKT-2042',
    createdAt: '2026-05-18 11:22',
    read: false,
  },
  {
    id: 'n_007',
    category: 'support',
    tone: 'warning',
    title: 'Urgent ticket opened',
    description:
      'Carlos Hernández · TKT-2041 · Bank still blocked after buying a coin pack',
    linkTo: '/dashboard/support/TKT-2041',
    createdAt: '2026-05-17 20:32',
    read: false,
  },
  {
    id: 'n_005',
    category: 'broadcast',
    tone: 'success',
    title: 'Broadcast sent',
    description:
      '“New Safety Features Rolled Out” sent to 12,842 recipients',
    linkTo: '/dashboard/broadcast',
    createdAt: '2026-05-14 10:00',
    read: true,
  },
  {
    id: 'n_003',
    category: 'user',
    tone: 'danger',
    title: 'Spend-lock rule breached',
    description:
      'Carlos Hernández exceeded his monthly limit by $1,200 on food delivery',
    linkTo: '/dashboard/users/u_002',
    createdAt: '2026-05-12 19:45',
    read: true,
  },
  {
    id: 'n_002',
    category: 'admin',
    tone: 'info',
    title: 'New admin account created',
    description: 'Renata Salinas added with the Manager role',
    linkTo: '/dashboard/admins',
    createdAt: '2026-05-10 14:20',
    read: true,
  },
  {
    id: 'n_001',
    category: 'user',
    tone: 'success',
    title: 'Coins purchased',
    description: 'Lucía Vega bought the Max pack — 200 coins for $199',
    linkTo: '/dashboard/users/u_005',
    createdAt: '2026-05-01 08:00',
    read: true,
  },
]
