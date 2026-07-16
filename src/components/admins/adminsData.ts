export type AdminPermission = string

export type AdminRole = 'super_admin' | 'admin'

export type AdminStatus = 'active' | 'suspended'

export type AdminAccount = {
  id: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  role: AdminRole
  permissions?: AdminPermission[]
  status: AdminStatus
  createdAt: string
  lastActiveAt?: string
}

export const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
}

export const rolePresets: Record<AdminRole, AdminPermission[]> = {
  super_admin: [],
  admin: [],
}

export const initialAdmins: AdminAccount[] = [
  {
    id: 'ad_001',
    name: 'Super Admin',
    email: 'admin@spendlock.com',
    phone: '+1 (555) 123-4567',
    role: 'super_admin',
    permissions: [],
    status: 'active',
    createdAt: '2024-01-12',
    lastActiveAt: '2026-05-17 09:42',
  },
  {
    id: 'ad_002',
    name: 'Renata Salinas',
    email: 'renata@spendlock.com',
    phone: '+1 (212) 555-0190',
    role: 'admin',
    permissions: [],
    status: 'active',
    createdAt: '2025-03-04',
    lastActiveAt: '2026-05-16 18:20',
  },
  {
    id: 'ad_003',
    name: 'Diego Pereira',
    email: 'diego@spendlock.com',
    role: 'admin',
    permissions: [],
    status: 'active',
    createdAt: '2025-08-19',
    lastActiveAt: '2026-05-15 14:05',
  },
  {
    id: 'ad_004',
    name: 'Lucía Méndez',
    email: 'lucia.m@spendlock.com',
    role: 'admin',
    permissions: [],
    status: 'suspended',
    createdAt: '2025-11-02',
    lastActiveAt: '2026-04-30 11:11',
  },
]

export function arraysEqual<T>(a: T[], b: T[]) {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((x) => set.has(x))
}

export function matchRole(perms: AdminPermission[]): AdminRole {
  return 'admin'
}
