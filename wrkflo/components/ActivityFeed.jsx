'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const fallbackItems = [
  { id: 1, type: 'comment', user: 'James Taylor', action: 'commented on', target: 'logo_primary.svg', time: '2 hours ago', color: 'text-orange-500' },
  { id: 2, type: 'approve', user: 'Dana Lee', action: 'approved', target: 'instagram_post.png', time: '3 hours ago', color: 'text-emerald-500' },
  { id: 3, type: 'upload', user: 'Sarah Chen', action: 'uploaded', target: 'business_card_mockup.png', time: '5 hours ago', color: 'text-orange-400' },
];

const typeIcon = (type) => {
  switch (type) {
    case 'comment':
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      );
    case 'approve':
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'upload':
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      );
    case 'changes':
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    default:
      return null;
  }
};

export default function ActivityFeed({ activities: propActivities = null }) {
  const [activities, setActivities] = useState(propActivities || null);
  const [loading, setLoading] = useState(!propActivities);

  useEffect(() => {
    if (propActivities) return;
    fetch('/api/activity')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setActivities(data);
        } else {
          setActivities(fallbackItems);
        }
        setLoading(false);
      })
      .catch(() => {
        setActivities(fallbackItems);
        setLoading(false);
      });
  }, [propActivities]);

  const displayItems = activities || fallbackItems;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        {loading && (
          <div className="w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      <div className="space-y-3">
        {displayItems.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className={`mt-0.5 flex-shrink-0 ${item.color}`}>
              {typeIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">{item.user}</span>
                {' '}{item.action}{' '}
                {item.projectId ? (
                  <Link href={`/project/${item.projectId}`} className="text-orange-500 hover:text-orange-600 hover:underline">
                    {item.target}
                  </Link>
                ) : (
                  <span className="text-orange-500">{item.target}</span>
                )}
              </p>
              {item.projectName && (
                <p className="text-xs text-gray-400 mt-0.5">{item.projectName}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
