'use client'
import { useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    google: any
    gapi: any
  }
}

interface PickedFile {
  id: string
  name: string
  mimeType: string
}

interface GoogleDrivePickerProps {
  onFilesPicked: (files: PickedFile[]) => void
  onCancel?: () => void
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function GoogleDrivePicker({ onFilesPicked, onCancel }: GoogleDrivePickerProps) {
  const pickerOpened = useRef(false)

  const openPicker = useCallback((accessToken: string) => {
    if (pickerOpened.current) return
    pickerOpened.current = true

    window.gapi.load('picker', () => {
      const view = new window.google.picker.DocsView()
        .setIncludeFolders(true)
        .setMimeTypes(
          'video/mp4,video/quicktime,video/webm,video/x-msvideo,' +
          'audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/x-wav,audio/flac,' +
          'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,' +
          'application/pdf'
        )
        .setSelectFolderEnabled(false)

      const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY!)
        .setAppId(process.env.NEXT_PUBLIC_GOOGLE_APP_ID!)
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const files: PickedFile[] = data.docs.map((doc: any) => ({
              id: doc.id,
              name: doc.name,
              mimeType: doc.mimeType,
            }))
            onFilesPicked(files)
          } else if (data.action === window.google.picker.Action.CANCEL) {
            onCancel?.()
          }
        })
        .setTitle('Select files from Google Drive')
        .build()

      picker.setVisible(true)
    })
  }, [onFilesPicked, onCancel])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        await loadScript('https://apis.google.com/js/api.js')
        await loadScript('https://accounts.google.com/gsi/client')

        if (cancelled) return

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          scope: 'https://www.googleapis.com/auth/drive.readonly',
          callback: (response: any) => {
            if (response.access_token) {
              openPicker(response.access_token)
            }
          },
        })

        tokenClient.requestAccessToken()
      } catch (err) {
        console.error('Failed to initialize Google Picker:', err)
      }
    }

    init()
    return () => { cancelled = true }
  }, [openPicker])

  return null
}
