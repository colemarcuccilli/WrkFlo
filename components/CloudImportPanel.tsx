'use client'
import { useState, useEffect } from 'react'
import GoogleDriveImporter from './GoogleDriveImporter'
import DropboxImporter from './DropboxImporter'
import OneDriveImporter from './OneDriveImporter'

type CloudTab = 'google_drive' | 'dropbox' | 'onedrive'

interface ProviderStatus {
  connected: boolean
  email: string | null
}

interface CloudImportPanelProps {
  projectId: string
  onImportComplete: (files: any[]) => void
}

const TABS: { key: CloudTab; label: string; icon: React.ReactNode }[] = [
  {
    key: 'google_drive',
    label: 'Google Drive',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA"/>
        <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L3.45 44.7c-.8 1.4-1.2 2.95-1.2 4.5h27.5L43.65 25z" fill="#00AC47"/>
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L84.1 61.5c.8-1.4 1.2-2.95 1.2-4.5H57.8l6.85 11.85L73.55 76.8z" fill="#EA4335"/>
        <path d="M43.65 25L57.4 1.2c-1.35-.8-2.9-1.2-4.5-1.2H34.4c-1.6 0-3.15.45-4.5 1.2L43.65 25z" fill="#00832D"/>
        <path d="M57.8 49.2H29.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h46.5c1.6 0 3.15-.45 4.5-1.2L57.8 49.2z" fill="#2684FC"/>
        <path d="M73.4 26.5L60.65 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.6 25l14.2 24.2h27.45c0-1.55-.4-3.1-1.2-4.5L73.4 26.5z" fill="#FFBA00"/>
      </svg>
    ),
  },
  {
    key: 'dropbox',
    label: 'Dropbox',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 256 218" xmlns="http://www.w3.org/2000/svg">
        <path d="M63.995 0L0 40.771l63.995 40.772L128 40.771zM192.005 0L128 40.771l64.005 40.772L256 40.771zM0 122.321l63.995 40.772L128 122.321 63.995 81.543zM192.005 81.543L128 122.321l64.005 40.772L256 122.321z" fill="#0061FF"/>
      </svg>
    ),
  },
  {
    key: 'onedrive',
    label: 'OneDrive',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.086 9.386a4.313 4.313 0 013.893-2.46c1.721 0 3.208 1.014 3.893 2.46a3.238 3.238 0 011.378-.307C21.32 9.079 23 10.759 23 12.829s-1.68 3.75-3.75 3.75H6.25A3.25 3.25 0 013 13.329c0-1.562 1.1-2.868 2.567-3.18a4.313 4.313 0 014.52-.763z" fill="#0364B8"/>
      </svg>
    ),
  },
]

const STATUS_URLS: Record<CloudTab, string> = {
  google_drive: '/api/google-drive/status',
  dropbox: '/api/dropbox/status',
  onedrive: '/api/onedrive/status',
}

export default function CloudImportPanel({ projectId, onImportComplete }: CloudImportPanelProps) {
  const [activeTab, setActiveTab] = useState<CloudTab>('google_drive')
  const [statuses, setStatuses] = useState<Record<CloudTab, ProviderStatus | null>>({
    google_drive: null,
    dropbox: null,
    onedrive: null,
  })

  useEffect(() => {
    // Fetch all provider statuses in parallel
    Object.entries(STATUS_URLS).forEach(([provider, url]) => {
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          setStatuses((prev) => ({
            ...prev,
            [provider]: {
              connected: data.connected,
              email: data.google_email || data.account_email || null,
            },
          }))
        })
        .catch(() => {
          setStatuses((prev) => ({
            ...prev,
            [provider]: { connected: false, email: null },
          }))
        })
    })
  }, [])

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-col px-3 pt-3 gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          const status = statuses[tab.key]
          const isConnected = status?.connected

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(21,243,236,0.12), rgba(22,255,192,0.08))'
                  : 'transparent',
                border: isActive
                  ? '1px solid rgba(21,243,236,0.2)'
                  : '1px solid transparent',
                color: isActive ? '#15f3ec' : 'rgba(255,255,255,0.45)',
              }}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {isConnected && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#16ffc0' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Active importer */}
      <div>
        {activeTab === 'google_drive' && (
          <GoogleDriveImporter projectId={projectId} onImportComplete={onImportComplete} />
        )}
        {activeTab === 'dropbox' && (
          <DropboxImporter projectId={projectId} onImportComplete={onImportComplete} />
        )}
        {activeTab === 'onedrive' && (
          <OneDriveImporter projectId={projectId} onImportComplete={onImportComplete} />
        )}
      </div>

    </div>
  )
}
