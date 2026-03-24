'use client'

import { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { BugReportModal } from '@/components/BugReportModal'
import { ErrorToast } from '@/components/ErrorToast'
import { FeedbackPrompt } from '@/components/FeedbackPrompt'

export function ErrorReportingProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
      <BugReportModal />
      <ErrorToast />
      <FeedbackPrompt />
    </ErrorBoundary>
  )
}
