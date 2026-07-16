export type TicketCategory =
  | 'unlock'
  | 'coins'
  | 'bank'
  | 'rules'
  | 'breach'
  | 'account'
  | 'app_block'
  | 'other'

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_customer'
  | 'resolved'
  | 'closed'

export type TicketChannel = 'email' | 'chat' | 'phone' | 'web'

export type TicketMessage = {
  id: string
  authorType: 'customer' | 'admin'
  authorName: string
  body: string
  createdAt: string
  internal?: boolean
}

export type Ticket = {
  id: string
  subject: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  channel: TicketChannel
  customerId: string
  assigneeId?: string
  assigneeName?: string
  createdAt: string
  updatedAt: string
  messages: TicketMessage[]
}

export const categoryLabels: Record<TicketCategory, string> = {
  unlock: 'Unlock issue',
  coins: 'Coins & billing',
  bank: 'Bank connection',
  rules: 'Lock rules',
  breach: 'Breach dispute',
  account: 'Account & login',
  app_block: 'App blocking',
  other: 'Other',
}

export const priorityLabels: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const statusLabels: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  waiting_customer: 'Waiting on customer',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const channelLabels: Record<TicketChannel, string> = {
  email: 'Email',
  chat: 'Live chat',
  phone: 'Phone',
  web: 'Help center',
}

export type SupportAgent = {
  id: string
  name: string
}

export const supportAgents: SupportAgent[] = [
  { id: 'a_001', name: 'Sabbir Ahmed' },
  { id: 'a_002', name: 'Renata Salinas' },
  { id: 'a_003', name: 'Diego Pereira' },
]

export const initialTickets: Ticket[] = [
  {
    id: 'TKT-2041',
    subject: 'Bank still blocked after buying a coin pack',
    category: 'unlock',
    priority: 'urgent',
    status: 'open',
    channel: 'email',
    customerId: 'u_002',
    createdAt: '2026-05-17 20:30',
    updatedAt: '2026-05-17 20:30',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'Carlos Hernández',
        createdAt: '2026-05-17 20:30',
        body: 'I breached my monthly limit last week and Spend Lock blocked my Bank of America and Chase cards plus Uber Eats and Amazon. I bought a coin pack from the app to unlock, but nothing changed — everything still shows as blocked and I cannot pay for anything. Please fix this urgently.',
      },
    ],
  },
  {
    id: 'TKT-2042',
    subject: 'Charged twice for the Starter coin pack',
    category: 'coins',
    priority: 'urgent',
    status: 'open',
    channel: 'chat',
    customerId: 'u_003',
    createdAt: '2026-05-18 11:20',
    updatedAt: '2026-05-18 11:20',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'Sofía Ramírez',
        createdAt: '2026-05-18 11:20',
        body: 'I bought the Starter pack (50 coins). The first attempt said "payment failed" so I retried, but my Citibank statement shows two $49 charges and only 50 coins were added to my balance. Please refund the duplicate charge.',
      },
    ],
  },
  {
    id: 'TKT-2043',
    subject: 'Cannot link my bank account',
    category: 'bank',
    priority: 'medium',
    status: 'in_progress',
    channel: 'web',
    customerId: 'u_007',
    assigneeId: 'a_002',
    assigneeName: 'Renata Salinas',
    createdAt: '2026-05-14 15:02',
    updatedAt: '2026-05-15 09:40',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'Andrea Castillo',
        createdAt: '2026-05-14 15:02',
        body: 'I want to start using spend locks, but every time I try to connect my bank the screen loads forever and then fails. I am on Android.',
      },
      {
        id: 'm_2',
        authorType: 'admin',
        authorName: 'Renata Salinas',
        createdAt: '2026-05-15 09:40',
        body: 'Hi Andrea, sorry about that. Which bank are you trying to link? A few banks need re-authentication on our side after a recent update. Please also update to the latest app version and try the connection again.',
      },
    ],
  },
  {
    id: 'TKT-2044',
    subject: 'How do I set up a time-based lock?',
    category: 'rules',
    priority: 'low',
    status: 'resolved',
    channel: 'web',
    customerId: 'u_005',
    assigneeId: 'a_003',
    assigneeName: 'Diego Pereira',
    createdAt: '2026-05-01 09:40',
    updatedAt: '2026-05-01 10:18',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'Lucía Vega',
        createdAt: '2026-05-01 09:40',
        body: 'How do I create a lock that blocks food delivery apps for the whole month? I want to do a spending fast in May.',
      },
      {
        id: 'm_2',
        authorType: 'admin',
        authorName: 'Diego Pereira',
        createdAt: '2026-05-01 10:05',
        body: 'Hi Lucía — go to Locks → New lock, choose "Time-based", set the start and end dates, then pick the Food category. The matching apps get blocked automatically for that window. Let me know if anything is unclear.',
      },
      {
        id: 'm_3',
        authorType: 'customer',
        authorName: 'Lucía Vega',
        createdAt: '2026-05-01 10:18',
        body: 'Done, set up "May spending fast". Thanks!',
      },
    ],
  },
  {
    id: 'TKT-2045',
    subject: 'Breach amount is wrong — includes a refunded transaction',
    category: 'breach',
    priority: 'high',
    status: 'waiting_customer',
    channel: 'email',
    customerId: 'u_002',
    assigneeId: 'a_001',
    assigneeName: 'Sabbir Ahmed',
    createdAt: '2026-05-13 10:00',
    updatedAt: '2026-05-16 09:30',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'Carlos Hernández',
        createdAt: '2026-05-13 10:00',
        body: 'Spend Lock logged a breach saying I went $1,200 over my monthly food delivery limit. That total is wrong — a large delivery order in it was refunded. Please review and correct the breach.',
      },
      {
        id: 'm_2',
        authorType: 'admin',
        authorName: 'Sabbir Ahmed',
        createdAt: '2026-05-13 14:20',
        body: 'Hi Carlos, I can look into this. The breach was calculated from transactions synced from your Bank of America account on 2026-05-12. Could you send the refund confirmation for the order you mentioned so I can recalculate the period total?',
      },
      {
        id: 'm_3',
        authorType: 'admin',
        authorName: 'Sabbir Ahmed',
        createdAt: '2026-05-16 09:30',
        body: 'Following up — still waiting on the refund confirmation so I can adjust the breach amount.',
      },
    ],
  },
  {
    id: 'TKT-2046',
    subject: 'Uber Eats blocked but food is not in my rules',
    category: 'app_block',
    priority: 'medium',
    status: 'closed',
    channel: 'chat',
    customerId: 'u_006',
    assigneeId: 'a_003',
    assigneeName: 'Diego Pereira',
    createdAt: '2026-05-08 16:10',
    updatedAt: '2026-05-09 09:00',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'Javier Ortiz',
        createdAt: '2026-05-08 16:10',
        body: 'Uber Eats is blocked on my phone, but my only active locks cover shopping and entertainment — I never added the food category. Why is it being blocked?',
      },
      {
        id: 'm_2',
        authorType: 'admin',
        authorName: 'Diego Pereira',
        createdAt: '2026-05-08 17:05',
        body: 'Thanks for flagging this — your "Monthly shopping & entertainment cap" rule is correct. The Uber Eats block was a category-sync glitch on our end, not your rule. I have cleared it and the app should open normally now.',
      },
      {
        id: 'm_3',
        authorType: 'admin',
        authorName: 'Diego Pereira',
        createdAt: '2026-05-09 09:00',
        body: 'Category-sync bug — food apps were wrongly included in this user’s block payload. Logged for the engineering team. Closing.',
        internal: true,
      },
    ],
  },
  {
    id: 'TKT-2047',
    subject: 'Account suspended — requesting an appeal',
    category: 'account',
    priority: 'high',
    status: 'in_progress',
    channel: 'phone',
    customerId: 'u_004',
    assigneeId: 'a_001',
    assigneeName: 'Sabbir Ahmed',
    createdAt: '2026-05-15 13:30',
    updatedAt: '2026-05-16 11:00',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'Diego Morales',
        createdAt: '2026-05-15 13:30',
        body: 'My account was suspended and I can no longer sign in. I still have a bank account linked and active locks running. I would like to know the reason and appeal the suspension.',
      },
      {
        id: 'm_2',
        authorType: 'admin',
        authorName: 'Sabbir Ahmed',
        createdAt: '2026-05-15 16:45',
        body: 'Hi Diego, your account was suspended after repeated policy violations flagged on the payment side. I have escalated your appeal to the Trust & Safety team for review and will update you here once they respond.',
      },
      {
        id: 'm_3',
        authorType: 'admin',
        authorName: 'Sabbir Ahmed',
        createdAt: '2026-05-16 11:00',
        body: 'Account banned 2026-04-29 for fraudulent payment attempts. Appeal forwarded to Trust & Safety — do not lift the suspension until they confirm.',
        internal: true,
      },
    ],
  },
  {
    id: 'TKT-2048',
    subject: 'Do my locks and coins carry over to a new phone?',
    category: 'other',
    priority: 'low',
    status: 'resolved',
    channel: 'web',
    customerId: 'u_001',
    assigneeId: 'a_002',
    assigneeName: 'Renata Salinas',
    createdAt: '2026-05-11 18:00',
    updatedAt: '2026-05-11 18:40',
    messages: [
      {
        id: 'm_1',
        authorType: 'customer',
        authorName: 'María González',
        createdAt: '2026-05-11 18:00',
        body: 'I am switching to a new phone. Will my spend-lock rules, my 120 coins, and my linked bank accounts carry over when I reinstall Spend Lock?',
      },
      {
        id: 'm_2',
        authorType: 'admin',
        authorName: 'Renata Salinas',
        createdAt: '2026-05-11 18:25',
        body: 'Hi María — yes, everything is tied to your account, not the device. Sign in on the new phone and your rules, coin balance, and linked banks will all sync automatically. Coins never expire either.',
      },
      {
        id: 'm_3',
        authorType: 'customer',
        authorName: 'María González',
        createdAt: '2026-05-11 18:40',
        body: 'Perfect, thanks!',
      },
    ],
  },
]
