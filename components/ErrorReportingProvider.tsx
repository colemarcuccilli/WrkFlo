'use client'

import { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { BugReportModal } from '@/components/BugReportModal'
import { ErrorToast } from '@/components/ErrorToast'

export function ErrorReportingProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
      <BugReportModal />
      <ErrorToast />
    </ErrorBoundary>
  )
}
