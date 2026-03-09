'use client';
import { useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RealtimeFilesProps {
  projectId: string;
  fileIds: string[];
  onFileChanged: (payload: { fileId: string; newData: any; eventType: string }) => void;
}

/**
 * Listens for realtime changes to files in a project.
 * Detects: new versions (version/url changes), status changes, new files added.
 */
export default function RealtimeFiles({ projectId, fileIds, onFileChanged }: RealtimeFilesProps) {
  const channelRef = useRef<any>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!projectId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`files:project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'files',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.new) {
            onFileChanged({
              fileId: (payload.new as any).id,
              newData: payload.new,
              eventType: 'UPDATE',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'files',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.new) {
            onFileChanged({
              fileId: (payload.new as any).id,
              newData: payload.new,
              eventType: 'INSERT',
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [projectId, supabase, onFileChanged]);

  return null;
}
