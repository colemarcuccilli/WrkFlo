'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    comments: true,
    approvals: true,
    changesRequested: true,
    newUploads: false,
    weeklyDigest: true,
  });

  const toggle = (key: string) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">WrkFlo</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
            <Link href="/team" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Team</Link>
            <Link href="/settings" className="text-sm font-medium text-gray-900 border-b-2 border-orange-500 pb-0.5">Settings</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/projects/new">
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </button>
            </Link>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-700">
              S
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and workspace preferences.</p>
        </div>

        {/* Profile Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-xl font-bold text-orange-700">S</div>
            <div>
              <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">Change photo</button>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or GIF · Max 2MB</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                defaultValue="Sarah Chen"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                defaultValue="sarah@wrkflo.app"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Role</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400 bg-white">
                <option>Creative Director</option>
                <option>Video Producer</option>
                <option>Graphic Designer</option>
                <option>Audio Engineer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Time Zone</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400 bg-white">
                <option>Eastern Time (ET)</option>
                <option>Pacific Time (PT)</option>
                <option>Central Time (CT)</option>
                <option>Mountain Time (MT)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors">Save Changes</button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-4">
            {[
              { key: 'comments', label: 'New Comments', desc: 'When a client or teammate leaves a comment' },
              { key: 'approvals', label: 'File Approvals', desc: 'When a file is approved by the client' },
              { key: 'changesRequested', label: 'Changes Requested', desc: 'When changes are requested on a file' },
              { key: 'newUploads', label: 'New Uploads', desc: 'When a team member uploads a new file' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of project activity every Monday' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    notifications[item.key as keyof typeof notifications] ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Workspace Branding</h2>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-orange-300 transition-colors cursor-pointer">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">Upload your logo</p>
            <p className="text-xs text-gray-400 mt-1">PNG or SVG · Appears on client review pages</p>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Workspace Name</label>
              <input
                type="text"
                defaultValue="Sweet Dreams Media"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#f97316" className="w-10 h-9 border border-gray-200 rounded-lg cursor-pointer" />
                <input type="text" defaultValue="#f97316" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-orange-400" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors">Save Branding</button>
          </div>
        </div>
      </main>
    </div>
  );
}
