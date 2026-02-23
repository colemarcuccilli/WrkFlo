import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

const DEMO_PROJECTS = [
  {
    name: 'Brand Identity Package',
    status: 'In Review',
    client_name: 'Northside Coffee Co.',
    files: [
      { name: 'logo-primary.svg', type: 'vector', version: 'V1', status: 'in-review', url: '/files/northside-logo.svg' },
      { name: 'brand-guidelines.pdf', type: 'pdf', version: 'V1', status: 'in-review', url: '/files/northside-guidelines.pdf' },
      { name: 'color-palette.ase', type: 'asset', version: 'V1', status: 'approved', url: '/files/northside-colors.ase' },
    ],
  },
  {
    name: 'Summer Campaign Videos',
    status: 'Changes Requested',
    client_name: 'Pulse Fitness',
    files: [
      { name: 'hero-video.mp4', type: 'video', version: 'V2', status: 'changes-requested', duration: 30, url: '/files/pulse-hero.mp4' },
      { name: 'social-cut-15s.mp4', type: 'video', version: 'V1', status: 'approved', duration: 15, url: '/files/pulse-social.mp4' },
      { name: 'behind-the-scenes.mp4', type: 'video', version: 'V1', status: 'draft', duration: 120, url: '/files/pulse-bts.mp4' },
    ],
  },
  {
    name: 'The Deep Cut Podcast',
    status: 'In Review',
    client_name: 'Independent',
    files: [
      { name: 'episode-cover-art.jpg', type: 'image', version: 'V1', status: 'in-review', url: '/files/podcast-cover.jpg' },
      { name: 'intro-animation.mp4', type: 'video', version: 'V1', status: 'approved', duration: 10, url: '/files/podcast-intro.mp4' },
      { name: 'sound-design.wav', type: 'audio', version: 'V1', status: 'in-review', url: '/files/podcast-sound.wav' },
    ],
  },
  {
    name: 'Social Media Pack',
    status: 'Approved',
    client_name: 'Urban Threads',
    files: [
      { name: 'instagram-pack.zip', type: 'archive', version: 'V1', status: 'approved', url: '/files/urban-ig.zip' },
      { name: 'facebook-assets.zip', type: 'archive', version: 'V1', status: 'approved', url: '/files/urban-fb.zip' },
      { name: 'twitter-header.png', type: 'image', version: 'V1', status: 'approved', url: '/files/urban-twitter.png' },
    ],
  },
  {
    name: 'Website Redesign',
    status: 'Draft',
    client_name: 'Bloom Architecture',
    files: [
      { name: 'homepage-mockup.fig', type: 'design', version: 'V1', status: 'draft', url: '/files/bloom-home.fig' },
      { name: 'about-page.fig', type: 'design', version: 'V1', status: 'draft', url: '/files/bloom-about.fig' },
      { name: 'style-tile.pdf', type: 'pdf', version: 'V1', status: 'draft', url: '/files/bloom-style.pdf' },
    ],
  },
  {
    name: 'Album Art & Singles',
    status: 'In Review',
    client_name: 'Zara Moon Music',
    files: [
      { name: 'album-cover-final.psd', type: 'design', version: 'V3', status: 'in-review', url: '/files/zara-album.psd' },
      { name: 'single-cover-midnight.psd', type: 'design', version: 'V1', status: 'approved', url: '/files/zara-midnight.psd' },
      { name: 'single-cover-echoes.psd', type: 'design', version: 'V2', status: 'in-review', url: '/files/zara-echoes.psd' },
    ],
  },
]

const FILE_VERSIONS = [
  { version_label: 'V1', notes: 'Initial version' },
  { version_label: 'V2', notes: 'Updated based on feedback' },
  { version_label: 'V3', notes: 'Final revision' },
]

const COMMENTS = [
  { author_name: 'Alex Rivera', author_role: 'client', content: 'Love the direction! Can we try a warmer palette?' },
  { author_name: 'Sarah Chen', author_role: 'creator', content: 'Sure thing! Updated version incoming.' },
  { author_name: 'Jordan Lee', author_role: 'client', content: 'This looks perfect. Approved!' },
  { author_name: 'Morgan Blake', author_role: 'client', content: 'The typography feels off. Can we explore other options?' },
  { author_name: 'Casey Kim', author_role: 'creator', content: 'Noted. I\'ll create some alternatives.' },
]

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()

  try {
    // 1. Skip user upsert — users table requires auth.users FK
    // Demo seed runs without a real auth user, creator_id will be null

    // 2. Delete existing demo projects and related data (those with null creator or demo name)
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .in('name', ['Brand Identity Package', 'Summer Campaign Videos', 'The Deep Cut Podcast', 'Social Media Pack', 'Website Redesign', 'Album Art & Singles'])

    if (existingProjects && existingProjects.length > 0) {
      const projectIds = existingProjects.map(p => p.id)
      
      // Get all file IDs for these projects
      const { data: files } = await supabase
        .from('files')
        .select('id')
        .in('project_id', projectIds)

      if (files && files.length > 0) {
        const fileIds = files.map(f => f.id)
        
        // Delete comments and versions for these files
        await supabase.from('comments').delete().in('file_id', fileIds)
        await supabase.from('file_versions').delete().in('file_id', fileIds)
      }

      // Delete files and projects
      await supabase.from('files').delete().in('project_id', projectIds)
      await supabase.from('project_members').delete().in('project_id', projectIds)
      await supabase.from('projects').delete().in('id', projectIds)
    }

    // 3. Insert demo projects with files, versions, and comments
    for (const projectData of DEMO_PROJECTS) {
      // Insert project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          creator_id: null,
          status: projectData.status,
          client_name: projectData.client_name,
        })
        .select()
        .single()

      if (projectError) {
        console.error('Project insert error:', projectError)
        return NextResponse.json({ error: projectError.message }, { status: 500 })
      }

      // Insert files for this project
      for (const fileData of projectData.files) {
        const { data: file, error: fileError } = await supabase
          .from('files')
          .insert({
            project_id: project.id,
            name: fileData.name,
            type: fileData.type,
            version: fileData.version,
            status: fileData.status,
            url: fileData.url || null,
            duration: fileData.duration || null,
            upload_date: new Date().toISOString().split('T')[0],
          })
          .select()
          .single()

        if (fileError) {
          console.error('File insert error:', fileError)
          return NextResponse.json({ error: fileError.message }, { status: 500 })
        }

        // Insert file versions (1-2 versions per file based on version number)
        const versionCount = parseInt(fileData.version.replace('V', ''))
        for (let i = 1; i <= Math.min(versionCount, 3); i++) {
          await supabase.from('file_versions').insert({
            file_id: file.id,
            version_label: `V${i}`,
            notes: FILE_VERSIONS[i - 1]?.notes || `Version ${i}`,
          })
        }

        // Insert comments for some files (not all)
        if (['in-review', 'changes-requested'].includes(fileData.status) && Math.random() > 0.3) {
          const commentCount = Math.floor(Math.random() * 2) + 1
          for (let i = 0; i < commentCount; i++) {
            const commentTemplate = COMMENTS[Math.floor(Math.random() * COMMENTS.length)]
            await supabase.from('comments').insert({
              file_id: file.id,
              author_id: null,
              author_name: commentTemplate.author_name,
              author_role: commentTemplate.author_role,
              content: commentTemplate.content,
              timestamp_data: null,
            })
          }
        }
      }
    }

    return NextResponse.json({ 
      message: 'Seed completed successfully',
      projectsCreated: DEMO_PROJECTS.length,
    }, { status: 201 })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
