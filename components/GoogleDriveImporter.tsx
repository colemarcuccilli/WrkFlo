'use client'
import { useState, useEffect } from 'react'
import GoogleDrivePicker from './GoogleDrivePicker'

interface GoogleDriveImporterProps {
  projectId: string
  onImportComplete: (files: any[]) => void
}

export default function GoogleDriveImporter({ projectId, onImportComplete }: GoogleDriveImporterProps) {
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    fetch('/api/google-drive/status')
      .then((r) => r.json())
      .then((data) => setDriveConnected(data.connected))
      .catch(() => setDriveConnected(false))
  }, [])

  const handleFilesPicked = async (files: { id: string; name: string; mimeType: string }[]) => {
    setShowPicker(false)
    setImporting(true)

    try {
      const res = await fetch('/api/google-drive/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, files }),
      })

      if (res.ok) {
        const created = await res.json()
        onImportComplete(created)
      }
    } catch (err) {
      console.error('Drive import failed:', err)
    }

    setImporting(false)
  }

  // Still loading status
  if (driveConnected === null) return null

  // Not connected — link to settings
  if (!driveConnected) {
    return (
      <div className="p-3 text-center">
        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Connect Google Drive in Settings to import files</p>
        <a
          href="/settings"
          className="text-xs font-medium"
          style={{ color: '#15f3ec' }}
        >
          Go to Settings →
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
          <svg className="w-4 h-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA"/>
            <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L3.45 44.7c-.8 1.4-1.2 2.95-1.2 4.5h27.5L43.65 25z" fill="#00AC47"/>
            <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L84.1 61.5c.8-1.4 1.2-2.95 1.2-4.5H57.8l6.85 11.85L73.55 76.8z" fill="#EA4335"/>
            <path d="M43.65 25L57.4 1.2c-1.35-.8-2.9-1.2-4.5-1.2H34.4c-1.6 0-3.15.45-4.5 1.2L43.65 25z" fill="#00832D"/>
            <path d="M57.8 49.2H29.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h46.5c1.6 0 3.15-.45 4.5-1.2L57.8 49.2z" fill="#2684FC"/>
            <path d="M73.4 26.5L60.65 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.6 25l14.2 24.2h27.45c0-1.55-.4-3.1-1.2-4.5L73.4 26.5z" fill="#FFBA00"/>
          </svg>
          Import from Google Drive
        </button>
      )}

      {showPicker && (
        <GoogleDrivePicker
          onFilesPicked={handleFilesPicked}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
