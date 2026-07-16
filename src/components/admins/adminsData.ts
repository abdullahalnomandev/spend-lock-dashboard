export type AdminPermission =
  | 'dashboard'
  | 'users'
  | 'revenue'
  | 'coin_packages'
  | 'broadcast'
  | 'support'
  | 'notifications'
  | 'admins'
  | 'settings'

export type AdminRole = 'super_admin' | 'manager' | 'support' | 'custom'

export type AdminStatus = 'active' | 'suspended'

export type AdminAccount = {
  id: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  role: AdminRole
  permissions: AdminPermission[]
  status: AdminStatus
  createdAt: string
  lastActiveAt?: string
}

export const permissionLabels: Record<AdminPermission, string> = {
  dashboard: 'Dashboard',
  users: 'Users',
  revenue: 'Revenue',
  coin_packages: 'Coin packages',
  broadcast: 'Broadcast',
  support: 'Support',
  notifications: 'Notifications',
  admins: 'Admin management',
  settings: 'Settings',
}

export const permissionDescriptions: Record<AdminPermission, string> = {
  dashboard: 'View the home dashboard, revenue trend, and open tickets',
  users: 'Manage customer accounts — edit profiles, restrict, ban, force-unlock',
  revenue: 'View revenue reports and coin purchase breakdowns',
  coin_packages: 'Create, edit, pause, and price coin packages',
  broadcast: 'Send announcements and push messages to users',
  support: 'View and respond to customer support tickets',
  notifications: 'View and manage the notifications feed',
  admins: 'Create, edit, and remove admin accounts',
  settings: 'Edit profile, FAQ, and platform content pages',
}

export const allPermissions: AdminPermission[] = [
  'dashboard',
  'users',
  'revenue',
  'coin_packages',
  'broadcast',
  'support',
  'notifications',
  'admins',
  'settings',
]

export const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  support: 'Support agent',
  custom: 'Custom',
}

export const rolePresets: Record<AdminRole, AdminPermission[]> = {
  super_admin: allPermissions,
  manager: [
    'dashboard',
    'users',
    'revenue',
    'coin_packages',
    'broadcast',
    'support',
    'notifications',
  ],
  support: ['dashboard', 'users', 'support', 'notifications'],
  custom: [],
}

export const initialAdmins: AdminAccount[] = [
  {
    id: 'ad_001',
    name: 'Super Admin',
    email: 'admin@spendlock.com',
    phone: '+1 (555) 123-4567',
    role: 'super_admin',
    permissions: allPermissions,
    status: 'active',
    createdAt: '2024-01-12',
    lastActiveAt: '2026-05-17 09:42',
  },
  {
    id: 'ad_002',
    name: 'Renata Salinas',
    email: 'renata@spendlock.com',
    phone: '+1 (212) 555-0190',
    role: 'manager',
    permissions: rolePresets.manager,
    status: 'active',
    createdAt: '2025-03-04',
    lastActiveAt: '2026-05-16 18:20',
  },
  {
    id: 'ad_003',
    name: 'Diego Pereira',
    email: 'diego@spendlock.com',
    role: 'support',
    permissions: rolePresets.support,
    status: 'active',
    createdAt: '2025-08-19',
    lastActiveAt: '2026-05-15 14:05',
  },
  {
    id: 'ad_004',
    name: 'Lucía Méndez',
    email: 'lucia.m@spendlock.com',
    role: 'custom',
    permissions: ['dashboard', 'revenue', 'coin_packages'],
    status: 'suspended',
    createdAt: '2025-11-02',
    lastActiveAt: '2026-04-30 11:11',
  },
]
