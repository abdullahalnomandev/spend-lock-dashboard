export type BroadcastType = 'announcement' | 'warning' | 'promo' | 'info'

export type BroadcastChannel = 'in_app' | 'email' | 'push'

export type BroadcastAudience =
  | 'all'
  | 'active'
  | 'restricted'
  | 'banned'
  | 'recent_orders'
  | 'no_orders'

export type BroadcastStatus = 'sent' | 'scheduled' | 'draft'

export type Broadcast = {
  id: string
  type: BroadcastType
  title: string
  message: string
  audience: BroadcastAudience
  channels: BroadcastChannel[]
  status: BroadcastStatus
  sentAt?: string
  scheduledFor?: string
  recipients: number
  readRate?: number
}

export const broadcastTypeLabels: Record<BroadcastType, string> = {
  announcement: 'Announcement',
  warning: 'Warning',
  promo: 'Promo',
  info: 'Info',
}

export const channelLabels: Record<BroadcastChannel, string> = {
  in_app: 'In-App',
  email: 'Email',
  push: 'Push',
}

export const audienceLabels: Record<BroadcastAudience, string> = {
  all: 'All Users',
  active: 'Active users only',
  restricted: 'Restricted users',
  banned: 'Banned users',
  recent_orders: 'Customers with recent orders',
  no_orders: 'Users with no orders yet',
}

export const MESSAGE_MAX = 280

export const initialBroadcasts: Broadcast[] = [
  {
    id: 'BC-008',
    type: 'announcement',
    title: 'Your Weekly Spending Recap Is Here',
    message:
      'Spend Lock now sends a personalised recap every Monday — see where your money went and how much your locks saved you.',
    audience: 'all',
    channels: ['in_app', 'email'],
    status: 'sent',
    sentAt: '2026-05-14 10:00',
    recipients: 12842,
    readRate: 0.69,
  },
  {
    id: 'BC-007',
    type: 'warning',
    title: 'Scheduled Maintenance — May 25',
    message:
      'Spend Lock will be unavailable from 02:00 to 04:00 UTC on May 25 for scheduled maintenance. Your active locks stay enforced the whole time.',
    audience: 'all',
    channels: ['in_app', 'email', 'push'],
    status: 'sent',
    sentAt: '2026-05-12 09:00',
    recipients: 12842,
    readRate: 0.75,
  },
  {
    id: 'BC-006',
    type: 'promo',
    title: 'Bonus Coins Weekend — 20% Extra',
    message:
      'Top up before Sunday and get 20% extra coins on every pack. Keep a balance ready so you can lift a lock the moment you need to.',
    audience: 'active',
    channels: ['in_app', 'push'],
    status: 'sent',
    sentAt: '2026-05-09 14:30',
    recipients: 4219,
    readRate: 0.5,
  },
  {
    id: 'BC-005',
    type: 'info',
    title: 'Updated Terms for Bank Connections',
    message:
      'We have updated our Terms of Service covering linked bank accounts and coin purchases. Review the changes any time in Settings.',
    audience: 'all',
    channels: ['in_app', 'email'],
    status: 'sent',
    sentAt: '2026-05-05 11:00',
    recipients: 12600,
    readRate: 0.62,
  },
  {
    id: 'BC-004',
    type: 'announcement',
    title: 'Join the May No-Spend Challenge',
    message:
      'Set a time-based lock for the final week of May and join the No-Spend Challenge. Keep your streak alive to earn bonus coins.',
    audience: 'active',
    channels: ['push'],
    status: 'scheduled',
    scheduledFor: '2026-05-25 09:00',
    recipients: 4219,
  },
]
