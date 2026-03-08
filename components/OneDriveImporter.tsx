'use client'
import { useState, useEffect } from 'react'
import OneDrivePicker from './OneDrivePicker'

interface OneDriveImporterProps {
  projectId: string
  onImportComplete: (files: any[]) => void
}

export default function OneDriveImporter({ projectId, onImportComplete }: OneDriveImporterProps) {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    fetch('/api/onedrive/status')
      .then((r) => r.json())
      .then((data) => setConnected(data.connected))
      .catch(() => setConnected(false))
  }, [])

  const handleFilesPicked = async (files: { id: string; name: string; mimeType: string }[]) => {
    setShowPicker(false)
    setImporting(true)

    try {
      const res = await fetch('/api/onedrive/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, files }),
      })

      if (res.ok) {
        const created = await res.json()
        onImportComplete(created)
      }
    } catch (err) {
      console.error('OneDrive import failed:', err)
    }

    setImporting(false)
  }

  if (connected === null) return null

  if (!connected) {
    return (
      <div className="p-3 text-center">
        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Connect OneDrive in Settings to import files</p>
        <a href="/settings" className="text-xs font-medium" style={{ color: '#15f3ec' }}>
          Go to Settings &rarr;
        </a>
      </div>
    )
  }

  return (
    <div className="p-3">
      {importing ? (
        <div className="flex items-center justify-center gap-2 py-2">
          <svg className="w-4 h-4 animate-spin" style={{ color: '#15f3ec' }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Importing files...</span>
        </div>
      ) : (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.086 9.386a4.313 4.313 0 013.893-2.46c1.721 0 3.208 1.014 3.893 2.46a3.238 3.238 0 011.378-.307C21.32 9.079 23 10.759 23 12.829s-1.68 3.75-3.75 3.75H6.25A3.25 3.25 0 013 13.329c0-1.562 1.1-2.868 2.567-3.18a4.313 4.313 0 014.52-.763z" fill="#0364B8"/>
          </svg>
          Import from OneDrive
        </button>
      )}

      {showPicker && (
        <OneDrivePicker
          onFilesPicked={handleFilesPicked}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
