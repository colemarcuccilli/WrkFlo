'use client'
import { useState, useEffect } from 'react'

interface OneDriveItem {
  id: string
  name: string
  isFolder: boolean
  size: number
  mimeType: string | null
  childCount: number
  lastModified: string
}

interface PickedFile {
  id: string
  name: string
  mimeType: string
}

interface OneDrivePickerProps {
  onFilesPicked: (files: PickedFile[]) => void
  onCancel?: () => void
}

const MEDIA_EXTENSIONS = new Set([
  'mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v',
  'mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
  'pdf',
])

function isMediaFile(item: OneDriveItem): boolean {
  if (item.isFolder) return false
  const ext = item.name.split('.').pop()?.toLowerCase() || ''
  return MEDIA_EXTENSIONS.has(ext)
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export default function OneDrivePicker({ onFilesPicked, onCancel }: OneDrivePickerProps) {
  const [items, setItems] = useState<OneDriveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [folderStack, setFolderStack] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'OneDrive' },
  ])
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const currentFolderId = folderStack[folderStack.length - 1].id

  useEffect(() => {
    loadFolder(currentFolderId)
  }, [currentFolderId])

  const loadFolder = async (folderId: string | null) => {
    setLoading(true)
    try {
      const url = folderId
        ? `/api/onedrive/browse?folderId=${folderId}`
        : '/api/onedrive/browse'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch {
      setItems([])
    }
    setLoading(false)
  }

  const openFolder = (item: OneDriveItem) => {
    setSelected(new Set())
    setFolderStack((prev) => [...prev, { id: item.id, name: item.name }])
  }

  const goBack = () => {
    if (folderStack.length <= 1) return
    setSelected(new Set())
    setFolderStack((prev) => prev.slice(0, -1))
  }

  const toggleSelect = (item: OneDriveItem) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(item.id)) {
        next.delete(item.id)
      } else {
        next.add(item.id)
      }
      return next
    })
  }

  const handleImport = () => {
    const picked: PickedFile[] = items
      .filter((item) => selected.has(item.id))
      .map((item) => ({
        id: item.id,
        name: item.name,
        mimeType: item.mimeType || 'application/octet-stream',
      }))
    onFilesPicked(picked)
  }

  const sortedItems = [...items].sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1
    if (!a.isFolder && b.isFolder) return 1
    return a.name.localeCompare(b.name)
  })

  // Filter: show folders + media files only
  const filteredItems = sortedItems.filter((item) => item.isFolder || isMediaFile(item))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            {folderStack.length > 1 && (
              <button
                onClick={goBack}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {folderStack[folderStack.length - 1].name}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* File list */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <svg className="w-5 h-5 animate-spin" style={{ color: '#15f3ec' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>No media files in this folder</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.isFolder ? openFolder(item) : toggleSelect(item)}
                className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                {/* Checkbox / folder icon */}
                {item.isFolder ? (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.5)">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                ) : (
                  <div
                    className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: selected.has(item.id) ? '#15f3ec' : 'rgba(255,255,255,0.2)',
                      background: selected.has(item.id) ? 'rgba(21,243,236,0.15)' : 'transparent',
                    }}
                  >
                    {selected.has(item.id) && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#15f3ec" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Name + size */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{item.name}</p>
                  {!item.isFolder && (
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{formatSize(item.size)}</p>
                  )}
                </div>

                {/* Folder arrow */}
                {item.isFolder && (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {selected.size > 0 ? `${selected.size} file${selected.size > 1 ? 's' : ''} selected` : 'Select files to import'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selected.size === 0}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-30"
              style={{
                background: 'linear-gradient(135deg, #15f3ec, #16ffc0)',
                color: '#0a0a0f',
              }}
            >
              Import {selected.size > 0 ? `(${selected.size})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
