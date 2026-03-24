// Non-blocking activity tracker for beta analytics
// Fires and forgets — never blocks the UI

export function trackActivity(
  action: string,
  opts?: {
    category?: string
    resourceType?: string
    resourceId?: string
    metadata?: Record<string, any>
    userId?: string
    userEmail?: string
  }
) {
  // Fire and forget — don't await, don't block
  try {
    const payload = {
      action,
      category: opts?.category || 'general',
      resource_type: opts?.resourceType,
      resource_id: opts?.resourceId,
      metadata: opts?.metadata || {},
      user_id: opts?.userId,
      user_email: opts?.userEmail,
    }

    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {}) // silently ignore failures
  } catch {
    // never throw from tracking
  }
}

// Convenience wrappers for common actions
export const track = {
  // Auth
  login: (email: string) => trackActivity('login', { category: 'auth', userEmail: email }),
  signup: (email: string) => trackActivity('signup', { category: 'auth', userEmail: email }),

  // Projects
  projectCreated: (projectId: string, userId?: string) =>
    trackActivity('project_created', { category: 'project', resourceType: 'project', resourceId: projectId, userId }),
  projectViewed: (projectId: string, userId?: string) =>
    trackActivity('project_viewed', { category: 'project', resourceType: 'project', resourceId: projectId, userId }),
  projectDeleted: (projectId: string, userId?: string) =>
    trackActivity('project_deleted', { category: 'project', resourceType: 'project', resourceId: projectId, userId }),

  // Files
  fileImported: (fileId: string, source: string, userId?: string) =>
    trackActivity('file_imported', { category: 'file', resourceType: 'file', resourceId: fileId, metadata: { source }, userId }),
  fileViewed: (fileId: string, userId?: string) =>
    trackActivity('file_viewed', { category: 'file', resourceType: 'file', resourceId: fileId, userId }),
  versionUploaded: (fileId: string, version: string, userId?: string) =>
    trackActivity('version_uploaded', { category: 'file', resourceType: 'file', resourceId: fileId, metadata: { version }, userId }),

  // Reviews
  reviewLinkShared: (projectId: string, userId?: string) =>
    trackActivity('review_link_shared', { category: 'review', resourceType: 'project', resourceId: projectId, userId }),
  reviewPageViewed: (projectId: string, token: string) =>
    trackActivity('review_page_viewed', { category: 'review', resourceType: 'project', resourceId: projectId, metadata: { token } }),

  // Comments
  commentAdded: (fileId: string, role: string, userId?: string) =>
    trackActivity('comment_added', { category: 'comment', resourceType: 'file', resourceId: fileId, metadata: { role }, userId }),

  // Status changes
  fileApproved: (fileId: string, userId?: string) =>
    trackActivity('file_approved', { category: 'status', resourceType: 'file', resourceId: fileId, userId }),
  changesRequested: (fileId: string, userId?: string) =>
    trackActivity('changes_requested', { category: 'status', resourceType: 'file', resourceId: fileId, userId }),

  // Client management
  clientInvited: (clientEmail: string, userId?: string) =>
    trackActivity('client_invited', { category: 'client', metadata: { clientEmail }, userId }),
  clientAccepted: (clientEmail: string) =>
    trackActivity('client_accepted', { category: 'client', metadata: { clientEmail } }),

  // Cloud storage
  cloudConnected: (provider: string, userId?: string) =>
    trackActivity('cloud_connected', { category: 'integration', metadata: { provider }, userId }),
  cloudDisconnected: (provider: string, userId?: string) =>
    trackActivity('cloud_disconnected', { category: 'integration', metadata: { provider }, userId }),

  // Feedback & bugs
  bugReported: (category: string, userId?: string) =>
    trackActivity('bug_reported', { category: 'feedback', metadata: { bugCategory: category }, userId }),
  feedbackSubmitted: (promptType: string, rating: number, userId?: string) =>
    trackActivity('feedback_submitted', { category: 'feedback', metadata: { promptType, rating }, userId }),

  // Navigation
  pageViewed: (path: string, userId?: string) =>
    trackActivity('page_viewed', { category: 'navigation', metadata: { path }, userId }),

  // Settings
  settingsChanged: (setting: string, userId?: string) =>
    trackActivity('settings_changed', { category: 'settings', metadata: { setting }, userId }),

  // Password protection
  passwordSet: (projectId: string, userId?: string) =>
    trackActivity('password_set', { category: 'security', resourceType: 'project', resourceId: projectId, userId }),
  passwordRemoved: (projectId: string, userId?: string) =>
    trackActivity('password_removed', { category: 'security', resourceType: 'project', resourceId: projectId, userId }),
}
