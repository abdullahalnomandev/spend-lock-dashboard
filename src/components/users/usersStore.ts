import { useSyncExternalStore } from 'react'
import { initialUsers, type OldUserRecord, type UserStatus } from './usersData'

let users: OldUserRecord[] = initialUsers
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return users
}

export function useUsers(): OldUserRecord[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useUser(id: string | undefined): OldUserRecord | undefined {
  const all = useUsers()
  return id ? all.find((u) => u.id === id) : undefined
}

export function updateUser(id: string, patch: Partial<OldUserRecord>) {
  users = users.map((u) => (u.id === id ? { ...u, ...patch } : u))
  emit()
}

export function setUserStatus(
  id: string,
  status: UserStatus,
  note?: string,
) {
  updateUser(id, { status, statusNote: note })
}

/**
 * Admin override: lift a user's spend lock — clears bank/app blocks,
 * marks every breach resolved, and restores blocked bank accounts.
 */
export function forceUnlock(id: string) {
  users = users.map((u): OldUserRecord => {
    if (u.id !== id) return u
    return {
      ...u,
      spendLock: {
        ...u.spendLock,
        status: 'unlocked',
        bankBlocked: false,
        blockedSince: undefined,
        blockedApps: [],
        rules: u.spendLock.rules.map((r) => ({ ...r, active: false })),
        breaches: u.spendLock.breaches.map((b) => ({ ...b, resolved: true })),
        bankAccounts: u.spendLock.bankAccounts.map((a) => ({
          ...a,
          status: 'active' as const,
        })),
      },
    }
  })
  emit()
}
