import { useSyncExternalStore } from 'react'
import { initialCoinPackages, type OldCoinPackage } from './coinPackagesData'

let packages: OldCoinPackage[] = initialCoinPackages
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
  return packages
}

function nextId() {
  const used = packages
    .map((p) => parseInt(p.id.replace('pkg_', ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = used.length ? Math.max(...used) : 0
  return `pkg_${max + 1}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function useCoinPackages(): OldCoinPackage[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getPackageById(id: string | undefined): OldCoinPackage | undefined {
  if (!id) return undefined
  return packages.find((p) => p.id === id)
}

export function createCoinPackage(
  input: Omit<OldCoinPackage, 'id' | 'createdAt' | 'active'> & { active?: boolean },
) {
  const entry: OldCoinPackage = {
    id: nextId(),
    createdAt: today(),
    active: input.active ?? true,
    ...input,
  }
  packages = [entry, ...packages]
  emit()
  return entry
}

export function updateCoinPackage(id: string, patch: Partial<OldCoinPackage>) {
  packages = packages.map((p) => (p.id === id ? { ...p, ...patch } : p))
  emit()
}

export function deleteCoinPackage(id: string) {
  packages = packages.filter((p) => p.id !== id)
  emit()
}

export function toggleCoinPackageActive(id: string) {
  packages = packages.map((p) =>
    p.id === id ? { ...p, active: !p.active } : p,
  )
  emit()
}
