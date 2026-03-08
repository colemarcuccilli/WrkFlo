'use client'
import { useState, useEffect } from 'react'

export default function OneDriveConnect() {
  const [status, setStatus] = useState<{ connected: boolean; account_email: string | null } | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    fetch('/api/onedrive/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false, account_email: null }))
  }, [])

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await fetch('/api/onedrive/disconnect', { method: 'POST' })
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
        {/* OneDrive icon */}
        <svg className="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.086 9.386a4.313 4.313 0 013.893-2.46c1.721 0 3.208 1.014 3.893 2.46a3.238 3.238 0 011.378-.307C21.32 9.079 23 10.759 23 12.829s-1.68 3.75-3.75 3.75H6.25A3.25 3.25 0 013 13.329c0-1.562 1.1-2.868 2.567-3.18a4.313 4.313 0 014.52-.763z" fill="#0364B8"/>
          <path d="M10.086 9.386a4.313 4.313 0 00-4.52.763A3.25 3.25 0 003 13.329c0 1.518 1.04 2.793 2.446 3.155l7.14-4.75 3.393-2.348a4.313 4.313 0 00-5.893 0z" fill="#0078D4"/>
          <path d="M19.25 9.079c-.474 0-.937.106-1.378.307a4.313 4.313 0 00-3.893-2.46 4.313 4.313 0 00-3.893 2.46l3.5 2.348 5.914 3.932A3.75 3.75 0 0023 12.829c0-2.07-1.68-3.75-3.75-3.75z" fill="#1490DF"/>
          <path d="M5.446 16.484A3.25 3.25 0 006.25 16.579h13c.684 0 1.33-.183 1.886-.503L13.586 11.734l-3.5-2.348a4.313 4.313 0 00-4.64 7.098z" fill="#28A8EA"/>
        </svg>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">OneDrive</h3>
          {status.connected ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-xs text-emerald-600">Connected</span>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Import files from OneDrive</p>
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
          href="/api/onedrive/auth"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.086 9.386a4.313 4.313 0 013.893-2.46c1.721 0 3.208 1.014 3.893 2.46a3.238 3.238 0 011.378-.307C21.32 9.079 23 10.759 23 12.829s-1.68 3.75-3.75 3.75H6.25A3.25 3.25 0 013 13.329c0-1.562 1.1-2.868 2.567-3.18a4.313 4.313 0 014.52-.763z" fill="#0364B8"/>
          </svg>
          Connect OneDrive
        </a>
      )}
    </div>
  )
}
