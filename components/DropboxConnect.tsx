'use client'
import { useState, useEffect } from 'react'

export default function DropboxConnect() {
  const [status, setStatus] = useState<{ connected: boolean; account_email: string | null } | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    fetch('/api/dropbox/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false, account_email: null }))
  }, [])

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await fetch('/api/dropbox/disconnect', { method: 'POST' })
      setStatus({ connected: false, account_email: null })
    } catch {
      // ignore
    }
    setDisconnecting(false)
  }

  if (!status) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-40 mb-3" />
        <div className="h-4 bg-gray-100 rounded w-60" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        {/* Dropbox icon */}
        <svg className="w-8 h-8" viewBox="0 0 256 218" xmlns="http://www.w3.org/2000/svg">
          <path d="M63.995 0L0 40.771l63.995 40.772L128 40.771zM192.005 0L128 40.771l64.005 40.772L256 40.771zM0 122.321l63.995 40.772L128 122.321 63.995 81.543zM192.005 81.543L128 122.321l64.005 40.772L256 122.321zM64.003 176.258L128.005 217.03l63.995-40.772L128.005 135.5z" fill="#0061FF"/>
        </svg>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Dropbox</h3>
          {status.connected ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-xs text-emerald-600">Connected</span>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Import files directly from Dropbox</p>
          )}
        </div>
      </div>

      {status.connected ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{status.account_email}</span>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <a
          href="/api/dropbox/auth"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 256 218" xmlns="http://www.w3.org/2000/svg">
            <path d="M63.995 0L0 40.771l63.995 40.772L128 40.771zM192.005 0L128 40.771l64.005 40.772L256 40.771zM0 122.321l63.995 40.772L128 122.321 63.995 81.543zM192.005 81.543L128 122.321l64.005 40.772L256 122.321z" fill="#0061FF"/>
          </svg>
          Connect Dropbox
        </a>
      )}
    </div>
  )
}
