'use client'
import { useState, useEffect } from 'react'
import DropboxPicker from './DropboxPicker'

interface DropboxImporterProps {
  projectId: string
  onImportComplete: (files: any[]) => void
}

export default function DropboxImporter({ projectId, onImportComplete }: DropboxImporterProps) {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    fetch('/api/dropbox/status')
      .then((r) => r.json())
      .then((data) => setConnected(data.connected))
      .catch(() => setConnected(false))
  }, [])

  const handleFilesPicked = async (files: { id: string; name: string; mimeType: string }[]) => {
    setShowPicker(false)
    setImporting(true)

    try {
      const res = await fetch('/api/dropbox/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, files }),
      })

      if (res.ok) {
        const created = await res.json()
        onImportComplete(created)
      }
    } catch (err) {
      console.error('Dropbox import failed:', err)
    }

    setImporting(false)
  }

  if (connected === null) return null

  if (!connected) {
    return (
      <div className="p-3 text-center">
        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Connect Dropbox in Settings to import files</p>
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
          <svg className="w-4 h-4" viewBox="0 0 256 218" xmlns="http://www.w3.org/2000/svg">
            <path d="M63.995 0L0 40.771l63.995 40.772L128 40.771zM192.005 0L128 40.771l64.005 40.772L256 40.771zM0 122.321l63.995 40.772L128 122.321 63.995 81.543zM192.005 81.543L128 122.321l64.005 40.772L256 122.321z" fill="#0061FF"/>
          </svg>
          Import from Dropbox
        </button>
      )}

      {showPicker && (
        <DropboxPicker
          onFilesPicked={handleFilesPicked}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
