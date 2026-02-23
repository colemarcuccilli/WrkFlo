'use client';
import { useState } from 'react';
import Link from 'next/link';
import { projects } from '@/lib/mock-data';
import ProjectCard from '@/components/ProjectCard';
import ActivityFeed from '@/components/ActivityFeed';

export default function DashboardPage() {
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'In Review', 'Changes Requested', 'Approved', 'Draft'];

  const filtered = filter === 'All' ? projects : projects.filter((p) => p.status === filter);

  const totalProjects = projects.length;
  const inReview = projects.filter((p) => p.status === 'In Review').length;
  const approved = projects.filter((p) => p.status === 'Approved').length;
  const changesReq = projects.filter((p) => p.status === 'Changes Requested').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">WrkFlo</span>
          </div>

          {/* Nav items */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-gray-900 border-b-2 border-orange-500 pb-0.5">Dashboard</Link>
            <Link href="/team" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Team</Link>
            <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Settings</Link>
          </nav>

          {/* Right side */}
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage and review all your creative deliverables.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: totalProjects, color: 'text-gray-900' },
            { label: 'In Review', value: inReview, color: 'text-orange-600' },
            { label: 'Changes Requested', value: changesReq, color: 'text-red-500' },
            { label: 'Approved', value: approved, color: 'text-emerald-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Project cards - 2/3 width */}
          <div className="lg:col-span-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-xl text-center">
                <p className="text-gray-500">No projects with status "{filter}"</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filtered.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

          {/* Activity feed - 1/3 width */}
          <div className="lg:col-span-1">
            <ActivityFeed />

            {/* Quick links */}
            <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Review Links</h3>
              <div className="space-y-2">
                {projects.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    href={`/review/${p.reviewToken}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.client}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
