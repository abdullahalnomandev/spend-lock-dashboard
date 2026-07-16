import { useSyncExternalStore } from 'react'

export type ContentKey = 'about' | 'privacy' | 'terms'

type Content = Record<ContentKey, string>

const defaults: Content = {
  about: `
    <h2>About Spend Lock</h2>
    <p>Spend Lock is a financial management tool designed to help users track their expenses and manage their budgets effectively. The platform provides a simple interface for logging transactions, setting spending limits, and generating reports to analyze financial habits.</p>
    <p>This admin dashboard gives the operations team everything needed to run the Spend Lock service day to day — managing users and orders, handling customer support, reviewing reports, and broadcasting updates.</p>
    <p><em>Version 1.0.0</em></p>
  `.trim(),
  privacy: `
    <h2>Privacy Policy</h2>
    <p>We collect the minimum personal information required to provide the marketplace service — account details, shipping addresses, payment method metadata, and order history. We do not sell personal data to third parties.</p>
    <p>Customer data is stored in encrypted form at rest and in transit. Only authorized admins with role-based access can view sensitive fields, and every access is logged for audit.</p>
    <p>Customers can request export or deletion of their personal data at any time by contacting support. Deletion requests are processed within 30 days subject to legal retention requirements.</p>
  `.trim(),
  terms: `
    <h2>Terms of Service</h2>
    <p>By using Spend Lock you agree to follow community guidelines, list only items you have the right to sell, and complete transactions honestly. Fraudulent listings, harassment, and policy violations may result in account restriction or termination.</p>
    <p>Spend Lock charges a marketplace fee on completed orders. Fees, payout schedules, and supported payment methods are described in the seller agreement.</p>
    <p>We may update these terms from time to time. Material changes will be announced through the in-app broadcast channel at least 14 days before they take effect.</p>
  `.trim(),
}

let content: Content = { ...defaults }
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
  return content
}

export function useContent(): Content {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function setContent(key: ContentKey, html: string) {
  content = { ...content, [key]: html }
  emit()
}

export function resetContent(key: ContentKey) {
  content = { ...content, [key]: defaults[key] }
  emit()
}
