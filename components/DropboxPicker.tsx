'use client'
import { useEffect, useRef } from 'react'

interface PickedFile {
  id: string
  name: string
  mimeType: string
}

interface DropboxPickerProps {
  onFilesPicked: (files: PickedFile[]) => void
  onCancel?: () => void
}

declare global {
  interface Window {
    Dropbox?: {
      choose: (options: any) => void
    }
  }
}

export default function DropboxPicker({ onFilesPicked, onCancel }: DropboxPickerProps) {
  const openedRef = useRef(false)

  useEffect(() => {
    if (openedRef.current) return
    openedRef.current = true

    const appKey = process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID

    // Load Dropbox Chooser SDK
    const loadAndOpen = () => {
      if (window.Dropbox) {
        openChooser()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://www.dropbox.com/static/api/2/dropins.js'
      script.id = 'dropboxjs'
      script.setAttribute('data-app-key', appKey || '')
      script.onload = () => openChooser()
      script.onerror = () => onCancel?.()
      document.head.appendChild(script)
    }

    const openChooser = () => {
      if (!window.Dropbox) {
        onCancel?.()
        return
      }

      window.Dropbox.choose({
        success: (files: any[]) => {
          const picked: PickedFile[] = files.map((f) => ({
            id: f.id,
            name: f.name,
            mimeType: getMimeType(f.name),
          }))
          onFilesPicked(picked)
        },
        cancel: () => onCancel?.(),
        linkType: 'direct',
        multiselect: true,
        extensions: [
          '.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v',
          '.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a',
          '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp',
          '.pdf',
        ],
        folderselect: false,
      })
    }

    loadAndOpen()
  }, [onFilesPicked, onCancel])

  return null
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const mimeMap: Record<string, string> = {
    mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
    mkv: 'video/x-matroska', webm: 'video/webm', m4v: 'video/x-m4v',
    mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac',
    flac: 'audio/flac', ogg: 'audio/ogg', m4a: 'audio/mp4',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp',
    pdf: 'application/pdf',
  }
  return mimeMap[ext] || 'application/octet-stream'
}
