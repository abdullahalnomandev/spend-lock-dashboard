export type UserStatus = 'active' | 'banned' | 'restricted'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed'

export type PaymentMethod =
  | 'card'
  | 'cash_on_delivery'
  | 'bank_transfer'
  | 'wallet'

export type ShippingMethod = 'standard' | 'express' | 'pickup'

export type Order = {
  id: string
  placedAt: string
  date: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  tax: number
  discount: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  shippingMethod: ShippingMethod
  shippingAddress: string
  trackingNumber?: string
  notes?: string
}

export type OrderItem = {
  productId: string
  name: string
  image?: string
  quantity: number
  price: number
}

// ─── Spend-lock domain ──────────────────────────────────────────────
// Users lock their spending by time or by limit. Breaking a rule blocks
// their bank transactions plus food / shopping apps until they spend
// coins (bought with real money) to unlock.

export type LockCategory = 'food' | 'shopping' | 'entertainment' | 'travel'

export type LockType = 'time' | 'limit'

export type LockPeriod = 'daily' | 'weekly' | 'monthly'

export type LockStatus = 'unlocked' | 'locked' | 'breached'

export type SpendRule = {
  id: string
  name: string
  type: LockType
  categories: LockCategory[]
  targetApps: BlockedApp[]
  active: boolean
  createdAt: string
  // time-based
  startsAt?: string
  endsAt?: string
  // limit-based
  limitAmount?: number
  period?: LockPeriod
  spentThisPeriod?: number
  savedAmount?: number
}

export type RuleBreach = {
  id: string
  occurredAt: string
  type: LockType
  reason: string
  overspendAmount?: number
  resolved: boolean
}

export type BlockedApp = {
  name: string
  category: LockCategory
}

export type BankAccount = {
  id: string
  bankName: string
  maskedNumber: string
  kind: 'checking' | 'savings' | 'credit'
  status: 'active' | 'blocked'
}

export type CoinTxn = {
  id: string
  at: string
  kind: 'purchase' | 'unlock'
  coins: number
  amount?: number
  packageId?: string
  note: string
}

export type SpendLockProfile = {
  status: LockStatus
  rules: SpendRule[]
  breaches: RuleBreach[]
  bankBlocked: boolean
  blockedSince?: string
  blockedApps: BlockedApp[]
  bankAccounts: BankAccount[]
  coinBalance: number
  coinHistory: CoinTxn[]
}

// ─── Onboarding profile ─────────────────────────────────────────────
// Captured in the post-registration setup flow: goal, biggest spending
// challenges, monthly budget, reminder prefs, and the bank link.

export type SavingsGoal =
  | 'save_money'
  | 'stop_impulse'
  | 'track_spending'
  | 'build_habits'

export type SpendChallenge =
  | 'late_night_food'
  | 'online_shopping'
  | 'coffee_cafes'
  | 'entertainment'
  | 'other'

export type ReminderPref =
  | 'lock_warnings'
  | 'streak_celebrations'
  | 'weekly_recaps'

export type OnboardingProfile = {
  goal: SavingsGoal
  challenges: SpendChallenge[]
  monthlyBudget: number
  reminders: ReminderPref[]
  bankConnected: boolean
  completedAt: string
}

// How the account was created — email/password sign-up or Google sign-in.
export type AuthProvider = 'email' | 'google'

// ─── Activity log ───────────────────────────────────────────────────
// Chronological events for a single user — auth events, spend-lock
// changes, coin transactions, and admin interventions.

export type ActivityType =
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'email_verified'
  | 'password_reset'
  | 'profile_updated'
  | 'bank_linked'
  | 'rule_created'
  | 'rule_paused'
  | 'rule_breached'
  | 'coins_purchased'
  | 'coins_spent'
  | 'force_unlock'
  | 'status_changed'
  | 'order_placed'

export type ActivityRecord = {
  id: string
  at: string
  type: ActivityType
  description: string
  device?: string
  location?: string
  byAdmin?: string
}

export type OldUserRecord = {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl?: string
  address: string
  city: string
  country: string
  joinedAt: string
  lastActiveAt: string
  status: UserStatus
  statusNote?: string
  orders: Order[]
  spendLock: SpendLockProfile
  onboarding: OnboardingProfile
  authProvider: AuthProvider
  emailVerified: boolean
  activities: ActivityRecord[]
}

// Keep UserRecord as OldUserRecord for backward compatibility
export type UserRecord = OldUserRecord

const product = (
  productId: string,
  name: string,
  price: number,
  quantity: number,
): OrderItem => ({ productId, name, price, quantity })

function buildOrder(opts: {
  id: string
  placedAt: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  shippingMethod: ShippingMethod
  shippingAddress: string
  items: OrderItem[]
  shippingFee?: number
  taxRate?: number
  discount?: number
  trackingNumber?: string
  notes?: string
}): Order {
  const subtotal = opts.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  )
  const shippingFee = opts.shippingFee ?? (opts.shippingMethod === 'express' ? 180 : opts.shippingMethod === 'pickup' ? 0 : 90)
  const discount = opts.discount ?? 0
  const tax = Math.round((subtotal - discount) * (opts.taxRate ?? 0.08))
  const total = subtotal + shippingFee + tax - discount
  return {
    id: opts.id,
    placedAt: opts.placedAt,
    date: opts.placedAt.slice(0, 10),
    items: opts.items,
    subtotal,
    shippingFee,
    tax,
    discount,
    total,
    status: opts.status,
    paymentStatus: opts.paymentStatus,
    paymentMethod: opts.paymentMethod,
    shippingMethod: opts.shippingMethod,
    shippingAddress: opts.shippingAddress,
    trackingNumber: opts.trackingNumber,
    notes: opts.notes,
  }
}

const act = (
  id: string,
  at: string,
  type: ActivityType,
  description: string,
  extra: { device?: string; location?: string; byAdmin?: string } = {},
): ActivityRecord => ({ id, at, type, description, ...extra })

export const initialUsers: UserRecord[] = [
  {
    id: 'u_001',
    authProvider: 'google',
    emailVerified: true,
    onboarding: {
      goal: 'save_money',
      challenges: ['online_shopping', 'coffee_cafes'],
      monthlyBudget: 6000,
      reminders: ['lock_warnings', 'weekly_recaps'],
      bankConnected: true,
      completedAt: '2024-02-14',
    },
    name: 'María González',
    email: 'maria.gonzalez@example.com',
    phone: '+1 (213) 555-0142',
    address: '1245 Wilshire Blvd, Apt 5B',
    city: 'Los Angeles',
    country: 'America',
    joinedAt: '2024-02-14',
    lastActiveAt: '2026-05-15',
    status: 'active',
    orders: [
      buildOrder({
        id: 'ORD-10042',
        placedAt: '2026-05-10 14:22',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        shippingMethod: 'express',
        shippingAddress: '1245 Wilshire Blvd, Apt 5B, Los Angeles, CA, America',
        trackingNumber: 'TIANG-1042-US',
        items: [
          product('p_010', 'Handwoven Oaxaca Rug', 950, 1),
          product('p_021', 'Talavera Ceramic Mug', 165, 2),
        ],
      }),
      buildOrder({
        id: 'ORD-09988',
        placedAt: '2026-04-22 10:05',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'wallet',
        shippingMethod: 'standard',
        shippingAddress: '1245 Wilshire Blvd, Apt 5B, Los Angeles, CA, America',
        trackingNumber: 'TIANG-9988-US',
        items: [
          product('p_021', 'Talavera Ceramic Mug', 165, 2),
          product('p_034', 'Mezcal Glass Set', 210, 1),
        ],
      }),
      buildOrder({
        id: 'ORD-09921',
        placedAt: '2026-04-05 09:33',
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        shippingMethod: 'standard',
        shippingAddress: '1245 Wilshire Blvd, Apt 5B, Los Angeles, CA, America',
        trackingNumber: 'TIANG-9921-US',
        items: [product('p_010', 'Handwoven Oaxaca Rug', 950, 2)],
      }),
    ],
    spendLock: {
      status: 'locked',
      rules: [
        {
          id: 'rule_1001',
          name: 'Monthly food & shopping budget',
          type: 'limit',
          categories: ['food', 'shopping'],
          active: true,
          createdAt: '2026-04-01',
          limitAmount: 6000,
          period: 'monthly',
          spentThisPeriod: 3850,
          savedAmount: 2150,
          targetApps: [
            { name: 'Uber Eats', category: 'food' },
            { name: 'Amazon', category: 'shopping' },
            { name: 'Mercado Libre', category: 'shopping' },
          ],
        },
        {
          id: 'rule_1002',
          name: 'No late-night food delivery',
          type: 'time',
          categories: ['food'],
          active: true,
          createdAt: '2026-05-01',
          startsAt: '2026-05-01',
          endsAt: '2026-06-01',
          targetApps: [
            { name: 'Uber Eats', category: 'food' },
            { name: 'Rappi', category: 'food' },
          ],
        },
      ],
      breaches: [
        {
          id: 'br_1001',
          occurredAt: '2026-02-18 21:14',
          type: 'limit',
          reason: 'Monthly shopping limit exceeded by $420',
          overspendAmount: 420,
          resolved: true,
        },
      ],
      bankBlocked: false,
      blockedApps: [],
      bankAccounts: [
        {
          id: 'ba_1001',
          bankName: 'Chase',
          maskedNumber: '•••• 4821',
          kind: 'checking',
          status: 'active',
        },
        {
          id: 'ba_1002',
          bankName: 'Wells Fargo',
          maskedNumber: '•••• 9075',
          kind: 'credit',
          status: 'active',
        },
      ],
      coinBalance: 120,
      coinHistory: [
        {
          id: 'cn_1001',
          at: '2026-02-18 21:30',
          kind: 'unlock',
          coins: -80,
          note: 'Unlocked shopping apps after limit breach',
        },
        {
          id: 'cn_1002',
          at: '2026-02-18 21:25',
          kind: 'purchase',
          coins: 200,
          amount: 199,
          packageId: 'pkg_200',
          note: 'Purchased Max pack (200 coins)',
        },
      ],
    },
    activities: [
      act('act_1_1', '2024-02-14 09:12', 'login', 'Signed up via Google', { device: 'iPhone · Safari', location: 'Los Angeles, CA' }),
      act('act_1_2', '2024-02-14 09:15', 'email_verified', 'Email verified via Google'),
      act('act_1_3', '2024-02-14 09:18', 'bank_linked', 'Linked Chase checking account'),
      act('act_1_4', '2024-05-22 14:30', 'bank_linked', 'Linked Wells Fargo credit card'),
      act('act_1_5', '2026-02-18 21:14', 'rule_breached', 'Monthly shopping limit exceeded by $420'),
      act('act_1_6', '2026-02-18 21:25', 'coins_purchased', 'Purchased 200 coins for $199'),
      act('act_1_7', '2026-02-18 21:30', 'coins_spent', 'Spent 80 coins to unlock shopping apps'),
      act('act_1_8', '2026-04-01 14:30', 'rule_created', 'Created rule "Monthly food & shopping budget"'),
      act('act_1_9', '2026-04-22 10:05', 'order_placed', 'Placed order ORD-09988 — 2 items ($673)'),
      act('act_1_10', '2026-05-01 08:14', 'rule_created', 'Created rule "No late-night food delivery"'),
      act('act_1_11', '2026-05-10 14:22', 'order_placed', 'Placed order ORD-10042 — Handwoven Oaxaca Rug + 2 mugs'),
      act('act_1_12', '2026-05-15 09:24', 'login', 'Signed in', { device: 'iPhone · Safari', location: 'Los Angeles, CA' }),
    ],
  },
  {
    id: 'u_002',
    authProvider: 'email',
    emailVerified: true,
    onboarding: {
      goal: 'stop_impulse',
      challenges: ['late_night_food', 'online_shopping'],
      monthlyBudget: 4000,
      reminders: ['lock_warnings'],
      bankConnected: true,
      completedAt: '2023-11-03',
    },
    name: 'Carlos Hernández',
    email: 'carlos.h@example.com',
    phone: '+1 (713) 555-0188',
    address: '830 Westheimer Rd',
    city: 'Houston',
    country: 'America',
    joinedAt: '2023-11-03',
    lastActiveAt: '2026-05-12',
    status: 'restricted',
    statusNote: 'Multiple chargeback disputes pending review.',
    orders: [
      buildOrder({
        id: 'ORD-09845',
        placedAt: '2026-03-18 16:48',
        status: 'refunded',
        paymentStatus: 'refunded',
        paymentMethod: 'card',
        shippingMethod: 'standard',
        shippingAddress: '830 Westheimer Rd, Houston, TX, America',
        notes: 'Customer reported item not as described. Refund issued in full.',
        items: [product('p_044', 'Leather Huarache Sandals', 720, 1)],
      }),
      buildOrder({
        id: 'ORD-09701',
        placedAt: '2026-02-02 11:10',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'cash_on_delivery',
        shippingMethod: 'standard',
        shippingAddress: '830 Westheimer Rd, Houston, TX, America',
        trackingNumber: 'TIANG-9701-US',
        items: [product('p_044', 'Leather Huarache Sandals', 720, 1)],
      }),
    ],
    spendLock: {
      status: 'breached',
      rules: [
        {
          id: 'rule_2001',
          name: 'Monthly food & shopping cap',
          type: 'limit',
          categories: ['food', 'shopping'],
          active: true,
          createdAt: '2026-03-01',
          limitAmount: 4000,
          period: 'monthly',
          spentThisPeriod: 5200,
          savedAmount: -1200,
          targetApps: [
            { name: 'Uber Eats', category: 'food' },
            { name: 'Rappi', category: 'food' },
            { name: 'Amazon', category: 'shopping' },
            { name: 'Mercado Libre', category: 'shopping' },
          ],
        },
        {
          id: 'rule_2002',
          name: 'Weekend shopping freeze',
          type: 'time',
          categories: ['shopping'],
          active: true,
          createdAt: '2026-05-10',
          startsAt: '2026-05-16',
          endsAt: '2026-05-18',
          targetApps: [
            { name: 'Amazon', category: 'shopping' },
            { name: 'Mercado Libre', category: 'shopping' },
          ],
        },
      ],
      breaches: [
        {
          id: 'br_2001',
          occurredAt: '2026-05-12 19:42',
          type: 'limit',
          reason: 'Monthly limit exceeded by $1,200 — food delivery spend',
          overspendAmount: 1200,
          resolved: false,
        },
        {
          id: 'br_2002',
          occurredAt: '2026-04-09 13:05',
          type: 'limit',
          reason: 'Monthly limit exceeded by $640',
          overspendAmount: 640,
          resolved: true,
        },
        {
          id: 'br_2003',
          occurredAt: '2026-03-22 11:18',
          type: 'limit',
          reason: 'Monthly limit exceeded by $310',
          overspendAmount: 310,
          resolved: true,
        },
      ],
      bankBlocked: true,
      blockedSince: '2026-05-12',
      blockedApps: [
        { name: 'Uber Eats', category: 'food' },
        { name: 'Rappi', category: 'food' },
        { name: 'Amazon', category: 'shopping' },
        { name: 'Mercado Libre', category: 'shopping' },
      ],
      bankAccounts: [
        {
          id: 'ba_2001',
          bankName: 'Bank of America',
          maskedNumber: '•••• 3310',
          kind: 'checking',
          status: 'blocked',
        },
        {
          id: 'ba_2002',
          bankName: 'Chase',
          maskedNumber: '•••• 7788',
          kind: 'credit',
          status: 'blocked',
        },
      ],
      coinBalance: 0,
      coinHistory: [
        {
          id: 'cn_2001',
          at: '2026-04-09 14:00',
          kind: 'unlock',
          coins: -150,
          note: 'Unlocked bank transactions after breach',
        },
        {
          id: 'cn_2002',
          at: '2026-04-09 13:50',
          kind: 'purchase',
          coins: 150,
          amount: 149,
          packageId: 'pkg_150',
          note: 'Purchased Pro pack (150 coins)',
        },
        {
          id: 'cn_2003',
          at: '2026-03-22 12:00',
          kind: 'unlock',
          coins: -100,
          note: 'Unlocked shopping apps after breach',
        },
        {
          id: 'cn_2004',
          at: '2026-03-22 11:55',
          kind: 'purchase',
          coins: 100,
          amount: 99,
          packageId: 'pkg_100',
          note: 'Purchased Plus pack (100 coins)',
        },
      ],
    },
    activities: [
      act('act_2_1', '2023-11-03 10:00', 'login', 'Signed up via email', { device: 'Android · Chrome', location: 'Houston, TX' }),
      act('act_2_2', '2023-11-03 10:05', 'email_verified', 'Email verified'),
      act('act_2_3', '2023-11-03 10:08', 'bank_linked', 'Linked Bank of America checking account'),
      act('act_2_4', '2024-02-09 15:22', 'bank_linked', 'Linked Chase credit card'),
      act('act_2_5', '2026-02-02 11:10', 'order_placed', 'Placed order ORD-09701 — Leather Huarache Sandals'),
      act('act_2_6', '2026-03-01 11:00', 'rule_created', 'Created rule "Monthly food & shopping cap"'),
      act('act_2_7', '2026-03-18 16:48', 'order_placed', 'Placed order ORD-09845 — Leather Huarache Sandals (refunded later)'),
      act('act_2_8', '2026-03-22 11:18', 'rule_breached', 'Monthly limit exceeded by $310'),
      act('act_2_9', '2026-03-22 11:55', 'coins_purchased', 'Purchased 100 coins for $99'),
      act('act_2_10', '2026-03-22 12:00', 'coins_spent', 'Spent 100 coins to unlock shopping apps'),
      act('act_2_11', '2026-04-09 13:05', 'rule_breached', 'Monthly limit exceeded by $640'),
      act('act_2_12', '2026-04-09 13:50', 'coins_purchased', 'Purchased 150 coins for $149'),
      act('act_2_13', '2026-04-09 14:00', 'coins_spent', 'Spent 150 coins to unlock bank transactions'),
      act('act_2_14', '2026-04-15 16:42', 'status_changed', 'Account restricted by admin — chargeback disputes pending review', { byAdmin: 'Diego Pereira' }),
      act('act_2_15', '2026-05-10 09:14', 'rule_created', 'Created rule "Weekend shopping freeze"'),
      act('act_2_16', '2026-05-12 19:42', 'rule_breached', 'Monthly limit exceeded by $1,200 — food delivery spend'),
      act('act_2_17', '2026-05-12 20:15', 'login', 'Signed in', { device: 'iPhone · Safari', location: 'Houston, TX' }),
    ],
  },
  {
    id: 'u_003',
    authProvider: 'google',
    emailVerified: true,
    onboarding: {
      goal: 'track_spending',
      challenges: ['entertainment'],
      monthlyBudget: 3000,
      reminders: ['lock_warnings', 'streak_celebrations', 'weekly_recaps'],
      bankConnected: true,
      completedAt: '2025-01-09',
    },
    name: 'Sofía Ramírez',
    email: 'sofia.ramirez@example.com',
    phone: '+1 (602) 555-0119',
    address: '4501 N Central Ave',
    city: 'Phoenix',
    country: 'America',
    joinedAt: '2025-01-09',
    lastActiveAt: '2026-05-16',
    status: 'active',
    orders: [
      buildOrder({
        id: 'ORD-10110',
        placedAt: '2026-05-14 08:42',
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        shippingMethod: 'express',
        shippingAddress: '4501 N Central Ave, Phoenix, AZ, America',
        items: [product('p_055', 'Silver Filigree Earrings', 880, 3)],
      }),
      buildOrder({
        id: 'ORD-10067',
        placedAt: '2026-05-02 19:14',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'wallet',
        shippingMethod: 'standard',
        shippingAddress: '4501 N Central Ave, Phoenix, AZ, America',
        trackingNumber: 'TIANG-0067-US',
        items: [
          product('p_055', 'Silver Filigree Earrings', 880, 1),
          product('p_021', 'Talavera Ceramic Mug', 165, 2),
          product('p_067', 'Embroidered Cotton Blouse', 110, 1),
        ],
      }),
    ],
    spendLock: {
      status: 'unlocked',
      rules: [],
      breaches: [],
      bankBlocked: false,
      blockedApps: [],
      bankAccounts: [
        {
          id: 'ba_3001',
          bankName: 'Citibank',
          maskedNumber: '•••• 5521',
          kind: 'checking',
          status: 'active',
        },
      ],
      coinBalance: 50,
      coinHistory: [
        {
          id: 'cn_3001',
          at: '2026-05-02 10:12',
          kind: 'purchase',
          coins: 50,
          amount: 49,
          packageId: 'pkg_50',
          note: 'Purchased Starter pack (50 coins)',
        },
      ],
    },
    activities: [
      act('act_3_1', '2025-01-09 14:22', 'login', 'Signed up via Google', { device: 'iPhone · Safari', location: 'Phoenix, AZ' }),
      act('act_3_2', '2025-01-09 14:24', 'email_verified', 'Email verified via Google'),
      act('act_3_3', '2025-01-09 14:25', 'bank_linked', 'Linked Citibank checking account'),
      act('act_3_4', '2026-05-02 10:12', 'coins_purchased', 'Purchased 50 coins for $49'),
      act('act_3_5', '2026-05-02 19:14', 'order_placed', 'Placed order ORD-10067 — 4 items ($2,475)'),
      act('act_3_6', '2026-05-14 08:42', 'order_placed', 'Placed order ORD-10110 — Silver Filigree Earrings'),
      act('act_3_7', '2026-05-16 11:10', 'login', 'Signed in', { device: 'iPhone · Safari', location: 'Phoenix, AZ' }),
    ],
  },
  {
    id: 'u_004',
    authProvider: 'email',
    emailVerified: false,
    onboarding: {
      goal: 'build_habits',
      challenges: ['late_night_food', 'online_shopping', 'entertainment'],
      monthlyBudget: 5000,
      reminders: [],
      bankConnected: true,
      completedAt: '2024-07-21',
    },
    name: 'Diego Morales',
    email: 'diego.morales@example.com',
    phone: '+1 (210) 555-0173',
    address: '215 Alamo Plaza',
    city: 'San Antonio',
    country: 'America',
    joinedAt: '2024-07-21',
    lastActiveAt: '2026-04-28',
    status: 'banned',
    statusNote: 'Repeated policy violations — fraudulent payment attempts.',
    orders: [
      buildOrder({
        id: 'ORD-09600',
        placedAt: '2026-01-15 22:01',
        status: 'cancelled',
        paymentStatus: 'failed',
        paymentMethod: 'card',
        shippingMethod: 'standard',
        shippingAddress: '215 Alamo Plaza, San Antonio, TX, America',
        notes: 'Payment declined — flagged for fraud review.',
        items: [product('p_072', 'Copper Cookware Set', 1450, 1)],
      }),
    ],
    spendLock: {
      status: 'breached',
      rules: [
        {
          id: 'rule_4001',
          name: 'Q2 spending freeze',
          type: 'time',
          categories: ['food', 'shopping', 'entertainment'],
          active: true,
          createdAt: '2026-04-01',
          startsAt: '2026-04-01',
          endsAt: '2026-07-01',
          targetApps: [
            { name: 'Uber Eats', category: 'food' },
            { name: 'DiDi Food', category: 'food' },
            { name: 'Amazon', category: 'shopping' },
            { name: 'Mercado Libre', category: 'shopping' },
            { name: 'Netflix', category: 'entertainment' },
            { name: 'Spotify', category: 'entertainment' },
          ],
        },
        {
          id: 'rule_4002',
          name: 'No new streaming subscriptions',
          type: 'limit',
          categories: ['entertainment'],
          active: true,
          createdAt: '2026-04-01',
          limitAmount: 0,
          period: 'monthly',
          spentThisPeriod: 0,
          savedAmount: 480,
          targetApps: [
            { name: 'Netflix', category: 'entertainment' },
            { name: 'Spotify', category: 'entertainment' },
          ],
        },
      ],
      breaches: [
        {
          id: 'br_4001',
          occurredAt: '2026-04-28 23:50',
          type: 'time',
          reason: 'Attempted spend during an active time lock',
          resolved: false,
        },
        {
          id: 'br_4002',
          occurredAt: '2026-04-21 18:30',
          type: 'time',
          reason: 'Attempted spend during an active time lock',
          resolved: false,
        },
        {
          id: 'br_4003',
          occurredAt: '2026-04-14 20:05',
          type: 'time',
          reason: 'Attempted spend during an active time lock',
          resolved: true,
        },
        {
          id: 'br_4004',
          occurredAt: '2026-04-08 09:40',
          type: 'time',
          reason: 'Attempted spend during an active time lock',
          resolved: true,
        },
        {
          id: 'br_4005',
          occurredAt: '2026-04-03 16:22',
          type: 'time',
          reason: 'Attempted spend during an active time lock',
          resolved: true,
        },
      ],
      bankBlocked: true,
      blockedSince: '2026-04-21',
      blockedApps: [
        { name: 'Uber Eats', category: 'food' },
        { name: 'DiDi Food', category: 'food' },
        { name: 'Amazon', category: 'shopping' },
        { name: 'Mercado Libre', category: 'shopping' },
        { name: 'Netflix', category: 'entertainment' },
        { name: 'Spotify', category: 'entertainment' },
      ],
      bankAccounts: [
        {
          id: 'ba_4001',
          bankName: 'Capital One',
          maskedNumber: '•••• 1209',
          kind: 'checking',
          status: 'blocked',
        },
      ],
      coinBalance: 0,
      coinHistory: [
        {
          id: 'cn_4001',
          at: '2026-04-14 20:30',
          kind: 'unlock',
          coins: -200,
          note: 'Unlocked bank transactions after breach',
        },
        {
          id: 'cn_4002',
          at: '2026-04-14 20:20',
          kind: 'purchase',
          coins: 200,
          amount: 199,
          packageId: 'pkg_200',
          note: 'Purchased Max pack (200 coins)',
        },
      ],
    },
    activities: [
      act('act_4_1', '2024-07-21 09:30', 'login', 'Signed up via email', { device: 'Android · Chrome', location: 'San Antonio, TX' }),
      act('act_4_2', '2024-07-21 09:35', 'bank_linked', 'Linked Capital One checking account'),
      act('act_4_3', '2026-01-15 22:01', 'order_placed', 'Order ORD-09600 placed — Copper Cookware Set'),
      act('act_4_4', '2026-01-15 22:03', 'login_failed', 'Payment declined — flagged for fraud review'),
      act('act_4_5', '2026-04-01 10:00', 'rule_created', 'Created time-lock rule "Q2 spending freeze"'),
      act('act_4_6', '2026-04-01 10:02', 'rule_created', 'Created rule "No new streaming subscriptions"'),
      act('act_4_7', '2026-04-03 16:22', 'rule_breached', 'Attempted spend during an active time lock'),
      act('act_4_8', '2026-04-08 09:40', 'rule_breached', 'Attempted spend during an active time lock'),
      act('act_4_9', '2026-04-14 20:05', 'rule_breached', 'Attempted spend during an active time lock'),
      act('act_4_10', '2026-04-14 20:20', 'coins_purchased', 'Purchased Max pack — 200 coins for $199'),
      act('act_4_11', '2026-04-14 20:30', 'coins_spent', 'Spent 200 coins to unlock bank transactions'),
      act('act_4_12', '2026-04-21 18:30', 'rule_breached', 'Attempted spend during an active time lock'),
      act('act_4_13', '2026-04-25 23:14', 'login_failed', 'Failed sign-in attempt — wrong password', { device: 'Unknown · Chrome', location: 'Unknown IP' }),
      act('act_4_14', '2026-04-26 00:08', 'login_failed', 'Failed sign-in attempt — wrong password', { device: 'Unknown · Chrome', location: 'Unknown IP' }),
      act('act_4_15', '2026-04-28 23:50', 'rule_breached', 'Attempted spend during an active time lock'),
      act('act_4_16', '2026-04-29 09:00', 'status_changed', 'Account banned by admin — repeated policy violations', { byAdmin: 'Diego Pereira' }),
    ],
  },
  {
    id: 'u_005',
    authProvider: 'google',
    emailVerified: true,
    onboarding: {
      goal: 'save_money',
      challenges: ['coffee_cafes', 'late_night_food'],
      monthlyBudget: 4000,
      reminders: ['streak_celebrations', 'weekly_recaps'],
      bankConnected: true,
      completedAt: '2025-08-30',
    },
    name: 'Lucía Vega',
    email: 'lucia.vega@example.com',
    phone: '+1 (305) 555-0156',
    address: '700 Ocean Drive',
    city: 'Miami',
    country: 'America',
    joinedAt: '2025-08-30',
    lastActiveAt: '2026-05-16',
    status: 'active',
    orders: [
      buildOrder({
        id: 'ORD-10125',
        placedAt: '2026-05-16 12:30',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'bank_transfer',
        shippingMethod: 'standard',
        shippingAddress: '700 Ocean Drive, Miami, FL, America',
        items: [product('p_067', 'Embroidered Cotton Blouse', 110, 3)],
      }),
    ],
    spendLock: {
      status: 'locked',
      rules: [
        {
          id: 'rule_5001',
          name: 'May spending fast',
          type: 'time',
          categories: ['food', 'shopping'],
          active: true,
          createdAt: '2026-05-01',
          startsAt: '2026-05-01',
          endsAt: '2026-06-01',
          targetApps: [
            { name: 'Uber Eats', category: 'food' },
            { name: 'Rappi', category: 'food' },
            { name: 'Amazon', category: 'shopping' },
          ],
        },
      ],
      breaches: [],
      bankBlocked: false,
      blockedApps: [],
      bankAccounts: [
        {
          id: 'ba_5001',
          bankName: 'Wells Fargo',
          maskedNumber: '•••• 6644',
          kind: 'checking',
          status: 'active',
        },
      ],
      coinBalance: 200,
      coinHistory: [
        {
          id: 'cn_5001',
          at: '2026-05-01 08:00',
          kind: 'purchase',
          coins: 200,
          amount: 199,
          packageId: 'pkg_200',
          note: 'Purchased Max pack (200 coins)',
        },
      ],
    },
    activities: [
      act('act_5_1', '2025-08-30 13:00', 'login', 'Signed up via Google', { device: 'iPhone · Safari', location: 'Miami, FL' }),
      act('act_5_2', '2025-08-30 13:04', 'email_verified', 'Email verified via Google'),
      act('act_5_3', '2025-08-30 13:10', 'bank_linked', 'Linked Wells Fargo checking account'),
      act('act_5_4', '2026-05-01 08:00', 'coins_purchased', 'Purchased 200 coins for $199'),
      act('act_5_5', '2026-05-01 08:30', 'rule_created', 'Created time-lock rule "May spending fast"'),
      act('act_5_6', '2026-05-16 12:30', 'order_placed', 'Placed order ORD-10125 — Embroidered Cotton Blouse'),
      act('act_5_7', '2026-05-16 14:11', 'login', 'Signed in', { device: 'iPhone · Safari', location: 'Miami, FL' }),
    ],
  },
  {
    id: 'u_006',
    authProvider: 'email',
    emailVerified: true,
    onboarding: {
      goal: 'stop_impulse',
      challenges: ['online_shopping', 'entertainment'],
      monthlyBudget: 8000,
      reminders: ['lock_warnings', 'weekly_recaps'],
      bankConnected: true,
      completedAt: '2024-05-12',
    },
    name: 'Javier Ortiz',
    email: 'javier.ortiz@example.com',
    phone: '+1 (303) 555-0127',
    address: '1890 Larimer St',
    city: 'Denver',
    country: 'America',
    joinedAt: '2024-05-12',
    lastActiveAt: '2026-05-11',
    status: 'active',
    orders: [
      buildOrder({
        id: 'ORD-09975',
        placedAt: '2026-04-18 15:55',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        shippingMethod: 'pickup',
        shippingAddress: 'Spend Lock Pickup Point #12, Denver, CO, America',
        items: [
          product('p_034', 'Mezcal Glass Set', 210, 4),
          product('p_010', 'Handwoven Oaxaca Rug', 950, 1),
          product('p_021', 'Talavera Ceramic Mug', 165, 2),
        ],
      }),
    ],
    spendLock: {
      status: 'locked',
      rules: [
        {
          id: 'rule_6001',
          name: 'Monthly shopping & entertainment cap',
          type: 'limit',
          categories: ['shopping', 'entertainment'],
          active: true,
          createdAt: '2026-05-01',
          limitAmount: 8000,
          period: 'monthly',
          spentThisPeriod: 7400,
          savedAmount: 600,
          targetApps: [
            { name: 'Amazon', category: 'shopping' },
            { name: 'Mercado Libre', category: 'shopping' },
            { name: 'Netflix', category: 'entertainment' },
            { name: 'Spotify', category: 'entertainment' },
          ],
        },
        {
          id: 'rule_6002',
          name: 'Block new subscriptions',
          type: 'limit',
          categories: ['entertainment'],
          active: true,
          createdAt: '2026-05-01',
          limitAmount: 0,
          period: 'monthly',
          spentThisPeriod: 0,
          savedAmount: 240,
          targetApps: [
            { name: 'Netflix', category: 'entertainment' },
            { name: 'Spotify', category: 'entertainment' },
          ],
        },
      ],
      breaches: [],
      bankBlocked: false,
      blockedApps: [],
      bankAccounts: [
        {
          id: 'ba_6001',
          bankName: 'Chase',
          maskedNumber: '•••• 2031',
          kind: 'checking',
          status: 'active',
        },
        {
          id: 'ba_6002',
          bankName: 'Chase',
          maskedNumber: '•••• 8890',
          kind: 'savings',
          status: 'active',
        },
      ],
      coinBalance: 80,
      coinHistory: [
        {
          id: 'cn_6001',
          at: '2026-05-03 17:45',
          kind: 'purchase',
          coins: 80,
          amount: 79,
          packageId: 'pkg_80',
          note: 'Purchased Standard pack (80 coins)',
        },
      ],
    },
    activities: [
      act('act_6_1', '2024-05-12 11:00', 'login', 'Signed up via email', { device: 'MacBook · Chrome', location: 'Denver, CO' }),
      act('act_6_2', '2024-05-12 11:05', 'email_verified', 'Email verified'),
      act('act_6_3', '2024-05-12 11:15', 'bank_linked', 'Linked Chase checking account'),
      act('act_6_4', '2025-09-22 14:30', 'bank_linked', 'Linked Chase savings account'),
      act('act_6_5', '2026-04-18 15:55', 'order_placed', 'Placed order ORD-09975 — Multi-item pickup order'),
      act('act_6_6', '2026-05-01 09:00', 'rule_created', 'Created rule "Monthly shopping & entertainment cap"'),
      act('act_6_7', '2026-05-01 09:05', 'rule_created', 'Created rule "Block new subscriptions"'),
      act('act_6_8', '2026-05-03 17:45', 'coins_purchased', 'Purchased 80 coins for $79'),
      act('act_6_9', '2026-05-11 18:20', 'login', 'Signed in', { device: 'MacBook · Chrome', location: 'Denver, CO' }),
    ],
  },
  {
    id: 'u_007',
    authProvider: 'email',
    emailVerified: false,
    onboarding: {
      goal: 'track_spending',
      challenges: ['other'],
      monthlyBudget: 2000,
      reminders: ['weekly_recaps'],
      bankConnected: false,
      completedAt: '2023-09-04',
    },
    name: 'Andrea Castillo',
    email: 'a.castillo@example.com',
    phone: '+1 (312) 555-0164',
    address: '330 N Wabash Ave',
    city: 'Chicago',
    country: 'America',
    joinedAt: '2023-09-04',
    lastActiveAt: '2026-05-14',
    status: 'active',
    orders: [],
    spendLock: {
      status: 'unlocked',
      rules: [],
      breaches: [],
      bankBlocked: false,
      blockedApps: [],
      bankAccounts: [],
      coinBalance: 0,
      coinHistory: [],
    },
    activities: [
      act('act_7_1', '2023-09-04 16:42', 'login', 'Signed up via email', { device: 'Android · Chrome', location: 'Chicago, IL' }),
      act('act_7_2', '2024-03-12 10:30', 'profile_updated', 'Updated phone number'),
      act('act_7_3', '2026-05-10 11:00', 'login', 'Signed in', { device: 'iPhone · Safari', location: 'Chicago, IL' }),
      act('act_7_4', '2026-05-14 09:22', 'login', 'Signed in', { device: 'iPhone · Safari', location: 'Chicago, IL' }),
    ],
  },
]

export function getUserById(id: string): UserRecord | undefined {
  return initialUsers.find((u) => u.id === id)
}

export type TopProduct = {
  productId: string
  name: string
  quantity: number
  totalSpent: number
}

export function topProductsForUser(user: UserRecord, limit = 5): TopProduct[] {
  const totals = new Map<string, TopProduct>()
  for (const order of user.orders) {
    for (const item of order.items) {
      const existing = totals.get(item.productId)
      if (existing) {
        existing.quantity += item.quantity
        existing.totalSpent += item.price * item.quantity
      } else {
        totals.set(item.productId, {
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          totalSpent: item.price * item.quantity,
        })
      }
    }
  }
  return Array.from(totals.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
}

export function userTotals(user: UserRecord) {
  const orderCount = user.orders.length
  const totalSpent = user.orders.reduce((sum, o) => sum + o.total, 0)
  const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0
  const lastOrderDate =
    user.orders
      .map((o) => o.date)
      .sort()
      .at(-1) ?? null
  return { orderCount, totalSpent, avgOrderValue, lastOrderDate }
}

// ─── Spend-lock labels & derived values ─────────────────────────────

export const lockCategoryLabels: Record<LockCategory, string> = {
  food: 'Food & dining',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  travel: 'Travel',
}

export const lockStatusLabels: Record<LockStatus, string> = {
  unlocked: 'Unlocked',
  locked: 'Locked',
  breached: 'Breached',
}

export const lockTypeLabels: Record<LockType, string> = {
  time: 'Time-based',
  limit: 'Limit-based',
}

export const lockPeriodLabels: Record<LockPeriod, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

export const bankAccountKindLabels: Record<BankAccount['kind'], string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit: 'Credit card',
}

/** Percent of the period limit already spent (0–100), or null for non-limit rules. */
export function ruleProgress(rule: SpendRule | undefined): number | null {
  if (!rule || rule.type !== 'limit' || !rule.limitAmount) return null
  const spent = rule.spentThisPeriod ?? 0
  return Math.min(100, Math.round((spent / rule.limitAmount) * 100))
}

/** Total time remaining (ms) on a time-based rule, or null if not applicable / expired. */
export function ruleTimeRemainingMs(rule: SpendRule): number | null {
  if (rule.type !== 'time' || !rule.endsAt) return null
  const ms = new Date(rule.endsAt).getTime() - Date.now()
  return ms > 0 ? ms : null
}

/** Aggregated spend-lock figures for a user — breaches, coins, money spent. */
export function spendLockSummary(user: UserRecord) {
  const sl = user.spendLock
  const purchases = sl.coinHistory.filter((c) => c.kind === 'purchase')
  const unlocks = sl.coinHistory.filter((c) => c.kind === 'unlock')
  return {
    breachCount: sl.breaches.length,
    openBreaches: sl.breaches.filter((b) => !b.resolved).length,
    lastBreach: sl.breaches.map((b) => b.occurredAt).sort().at(-1) ?? null,
    coinsPurchased: purchases.reduce((n, c) => n + c.coins, 0),
    coinsSpent: unlocks.reduce((n, c) => n + Math.abs(c.coins), 0),
    moneySpent: purchases.reduce((n, c) => n + (c.amount ?? 0), 0),
    unlockCount: unlocks.length,
    blockedAppCount: sl.blockedApps.length,
    activeRuleCount: sl.rules.filter((r) => r.active).length,
    totalRuleCount: sl.rules.length,
    totalSaved: sl.rules.reduce(
      (sum, r) => sum + Math.max(0, r.savedAmount ?? 0),
      0,
    ),
  }
}

// ─── Onboarding labels ──────────────────────────────────────────────

export const savingsGoalLabels: Record<SavingsGoal, string> = {
  save_money: 'Save more money',
  stop_impulse: 'Stop impulse buying',
  track_spending: 'Track spending',
  build_habits: 'Build better habits',
}

export const spendChallengeLabels: Record<SpendChallenge, string> = {
  late_night_food: 'Late-night food delivery',
  online_shopping: 'Online shopping sprees',
  coffee_cafes: 'Coffee & cafés',
  entertainment: 'Entertainment',
  other: 'Something else',
}

export const reminderPrefLabels: Record<ReminderPref, string> = {
  lock_warnings: 'Lock-time warnings',
  streak_celebrations: 'Streak celebrations',
  weekly_recaps: 'Weekly recaps',
}

export const authProviderLabels: Record<AuthProvider, string> = {
  email: 'Email & password',
  google: 'Google',
}
