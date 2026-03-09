'use client';
import { useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RealtimeCommentsProps {
  fileId: string | null;
  onNewComment: (comment: any) => void;
}

// Normalize a raw comment from Supabase Realtime
function normalizeComment(c: any) {
  return {
    id: c.id,
    author: c.author_name || 'Unknown',
    authorRole: c.author_role || 'client',
    content: c.content,
    timestamp: c.timestamp_data || null,
    createdAt: c.created_at ? new Date(c.created_at).toLocaleString() : '',
  };
}

export default function RealtimeComments({ fileId, onNewComment }: RealtimeCommentsProps) {
  const channelRef = useRef<any>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!fileId) return;

    // Clean up previous subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Subscribe to new comments for this file
    const channel = supabase
      .channel(`comments:file:${fileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `file_id=eq.${fileId}`,
        },
        (payload) => {
          if (payload.new) {
            const normalized = normalizeComment(payload.new);
            onNewComment(normalized);
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
  }, [fileId, onNewComment, supabase]);

  // This component renders nothing — it's purely functional
  return null;
}
