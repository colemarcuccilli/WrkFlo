export const projects = [
  {
    id: 'proj-001',
    name: 'Brand Identity Package',
    client: 'Northside Coffee Co.',
    status: 'In Review',
    createdAt: '2026-02-10',
    lastActivity: '2 hours ago',
    reviewToken: 'review-abc123',
    creatorName: 'Sarah Chen',
    files: [
      {
        id: 'f-001-1',
        name: 'logo_primary.svg',
        type: 'image',
        version: 'V3',
        status: 'in-review',
        uploadDate: '2026-02-20',
        url: 'https://placehold.co/800x600/f97316/ffffff?text=Logo+Primary+SVG',
        versions: [
          { version: 'V1', date: '2026-02-10', notes: 'Initial concept — bold wordmark' },
          { version: 'V2', date: '2026-02-15', notes: 'Client requested warmer tones and icon mark' },
          { version: 'V3', date: '2026-02-20', notes: 'Refined icon, adjusted kerning, final colors' },
        ],
        comments: [
          { id: 'c-001-1-1', author: 'James Taylor', authorRole: 'client', content: 'Love the new icon mark! Can we try the wordmark in a slightly heavier weight?', timestamp: { x: 45, y: 60 }, createdAt: '2026-02-21 9:14 AM' },
          { id: 'c-001-1-2', author: 'Sarah Chen', authorRole: 'creator', content: 'Noted — I\'ll test a semi-bold cut. The current weight is set for digital reproduction clarity.', timestamp: { x: 48, y: 63 }, createdAt: '2026-02-21 10:02 AM' },
          { id: 'c-001-1-3', author: 'James Taylor', authorRole: 'client', content: 'The green feels right for our brand. Good direction.', timestamp: { x: 20, y: 30 }, createdAt: '2026-02-22 2:15 PM' },
        ],
      },
      {
        id: 'f-001-2',
        name: 'brand_guide.pdf',
        type: 'document',
        version: 'V2',
        status: 'approved',
        uploadDate: '2026-02-18',
        url: null,
        versions: [
          { version: 'V1', date: '2026-02-12', notes: 'Draft brand guide — typography and color sections' },
          { version: 'V2', date: '2026-02-18', notes: 'Added photography direction, logo usage rules' },
        ],
        comments: [
          { id: 'c-001-2-1', author: 'James Taylor', authorRole: 'client', content: 'The typography section is excellent. Exactly what we needed.', timestamp: null, createdAt: '2026-02-19 11:30 AM' },
          { id: 'c-001-2-2', author: 'Sarah Chen', authorRole: 'creator', content: 'Thank you! I added the misuse examples on page 8 — those tend to be helpful for the team.', timestamp: null, createdAt: '2026-02-19 12:45 PM' },
        ],
      },
      {
        id: 'f-001-3',
        name: 'business_card_mockup.png',
        type: 'image',
        version: 'Final',
        status: 'changes-requested',
        uploadDate: '2026-02-21',
        url: 'https://placehold.co/800x500/f97316/ffffff?text=Business+Card+Mockup',
        versions: [
          { version: 'V1', date: '2026-02-14', notes: 'Horizontal layout, white background' },
          { version: 'V2', date: '2026-02-18', notes: 'Dark version added, rounded corners' },
          { version: 'Final', date: '2026-02-21', notes: 'Both colorways, print-ready specs' },
        ],
        comments: [
          { id: 'c-001-3-1', author: 'James Taylor', authorRole: 'client', content: 'The dark version looks premium. Can the phone number font be a touch larger?', timestamp: { x: 70, y: 75 }, createdAt: '2026-02-22 3:20 PM' },
          { id: 'c-001-3-2', author: 'James Taylor', authorRole: 'client', content: 'Also — the tagline feels too small on the white version.', timestamp: { x: 30, y: 80 }, createdAt: '2026-02-22 3:22 PM' },
        ],
      },
    ],
  },
  {
    id: 'proj-002',
    name: 'Summer Campaign Videos',
    client: 'Pulse Fitness',
    status: 'Changes Requested',
    createdAt: '2026-02-05',
    lastActivity: '45 minutes ago',
    reviewToken: 'review-def456',
    creatorName: 'Marcus Rivera',
    files: [
      {
        id: 'f-002-1',
        name: 'hero_video.mp4',
        type: 'video',
        version: 'V2',
        status: 'changes-requested',
        uploadDate: '2026-02-19',
        url: '/api/placeholder/video',
        duration: 120,
        versions: [
          { version: 'V1', date: '2026-02-10', notes: 'Rough cut — full 2-minute hero spot' },
          { version: 'V2', date: '2026-02-19', notes: 'Color graded, music added, intro tightened' },
        ],
        comments: [
          { id: 'c-002-1-1', author: 'Alex Kim', authorRole: 'client', content: 'The opening energy is perfect — really grabs attention.', timestamp: 8, createdAt: '2026-02-20 10:00 AM' },
          { id: 'c-002-1-2', author: 'Alex Kim', authorRole: 'client', content: 'The transition at this point feels a bit abrupt. Can we smooth it out?', timestamp: 34, createdAt: '2026-02-20 10:05 AM' },
          { id: 'c-002-1-3', author: 'Marcus Rivera', authorRole: 'creator', content: 'Noted — I\'ll add a cross-dissolve here and re-time the cut.', timestamp: 34, createdAt: '2026-02-20 11:30 AM' },
          { id: 'c-002-1-4', author: 'Alex Kim', authorRole: 'client', content: 'The music drop at this point is fire! Keep exactly this.', timestamp: 67, createdAt: '2026-02-20 10:12 AM' },
          { id: 'c-002-1-5', author: 'Alex Kim', authorRole: 'client', content: 'Logo at the end needs to be 10% bigger and hold for 2 more seconds.', timestamp: 108, createdAt: '2026-02-20 10:18 AM' },
        ],
      },
      {
        id: 'f-002-2',
        name: 'social_cut_15s.mp4',
        type: 'video',
        version: 'V1',
        status: 'in-review',
        uploadDate: '2026-02-21',
        url: '/api/placeholder/video',
        duration: 15,
        versions: [
          { version: 'V1', date: '2026-02-21', notes: '15-second social cut for Instagram/TikTok' },
        ],
        comments: [
          { id: 'c-002-2-1', author: 'Alex Kim', authorRole: 'client', content: 'Great pace for social! The thumbnail frame is strong.', timestamp: 3, createdAt: '2026-02-22 9:00 AM' },
          { id: 'c-002-2-2', author: 'Alex Kim', authorRole: 'client', content: 'Add subtitles/captions — 80% of social video is watched without sound.', timestamp: 7, createdAt: '2026-02-22 9:05 AM' },
        ],
      },
      {
        id: 'f-002-3',
        name: 'story_vertical.mp4',
        type: 'video',
        version: 'V1',
        status: 'draft',
        uploadDate: '2026-02-22',
        url: '/api/placeholder/video',
        duration: 30,
        versions: [
          { version: 'V1', date: '2026-02-22', notes: 'Vertical 9:16 story format — draft' },
        ],
        comments: [],
      },
    ],
  },
  {
    id: 'proj-003',
    name: 'The Deep Cut Podcast',
    client: 'Independent',
    status: 'In Review',
    createdAt: '2026-02-01',
    lastActivity: '1 day ago',
    reviewToken: 'review-ghi789',
    creatorName: 'DJ Nomad',
    files: [
      {
        id: 'f-003-1',
        name: 'episode_42_raw.wav',
        type: 'audio',
        version: 'V1',
        status: 'in-review',
        uploadDate: '2026-02-18',
        url: '/api/placeholder/audio',
        duration: 3600,
        versions: [
          { version: 'V1', date: '2026-02-18', notes: 'Raw recorded session — no processing' },
        ],
        comments: [
          { id: 'c-003-1-1', author: 'Nina Park', authorRole: 'client', content: 'There\'s some room noise here. Needs noise gate.', timestamp: 245, createdAt: '2026-02-19 2:00 PM' },
          { id: 'c-003-1-2', author: 'Nina Park', authorRole: 'client', content: 'Great conversation flow in this section. Keep this energy.', timestamp: 890, createdAt: '2026-02-19 2:15 PM' },
          { id: 'c-003-1-3', author: 'DJ Nomad', authorRole: 'creator', content: 'Noise gate applied in the mixed version. Check episode_42_mixed for comparison.', timestamp: 245, createdAt: '2026-02-20 10:00 AM' },
        ],
      },
      {
        id: 'f-003-2',
        name: 'episode_42_mixed.mp3',
        type: 'audio',
        version: 'V2',
        status: 'approved',
        uploadDate: '2026-02-20',
        url: '/api/placeholder/audio',
        duration: 3580,
        versions: [
          { version: 'V1', date: '2026-02-19', notes: 'Initial mix — EQ and compression applied' },
          { version: 'V2', date: '2026-02-20', notes: 'Noise gate added, levels normalized to -16 LUFS' },
        ],
        comments: [
          { id: 'c-003-2-1', author: 'Nina Park', authorRole: 'client', content: 'Love the energy here, but can we push the bass a bit more?', timestamp: 47, createdAt: '2026-02-21 3:42 PM' },
          { id: 'c-003-2-2', author: 'DJ Nomad', authorRole: 'creator', content: 'Bumped the low shelf by 2dB — feels warmer now.', timestamp: 47, createdAt: '2026-02-21 5:00 PM' },
          { id: 'c-003-2-3', author: 'Nina Park', authorRole: 'client', content: 'Approved! This is ready to publish.', timestamp: null, createdAt: '2026-02-22 10:00 AM' },
        ],
      },
      {
        id: 'f-003-3',
        name: 'intro_music.mp3',
        type: 'audio',
        version: 'Final',
        status: 'locked',
        uploadDate: '2026-02-05',
        url: '/api/placeholder/audio',
        duration: 30,
        versions: [
          { version: 'Final', date: '2026-02-05', notes: 'Final approved intro jingle — do not modify' },
        ],
        comments: [
          { id: 'c-003-3-1', author: 'Nina Park', authorRole: 'client', content: 'Perfect. This is locked. Use across all episodes.', timestamp: 5, createdAt: '2026-02-05 12:00 PM' },
        ],
      },
    ],
  },
  {
    id: 'proj-004',
    name: 'Social Media Pack',
    client: 'Urban Threads',
    status: 'Approved',
    createdAt: '2026-01-28',
    lastActivity: '3 days ago',
    reviewToken: 'review-jkl012',
    creatorName: 'Priya Sharma',
    files: [
      {
        id: 'f-004-1',
        name: 'instagram_post.png',
        type: 'image',
        version: 'Final',
        status: 'approved',
        uploadDate: '2026-02-15',
        url: 'https://placehold.co/1080x1080/f97316/ffffff?text=Instagram+Post+Final',
        versions: [
          { version: 'V1', date: '2026-02-01', notes: 'Initial layout concepts (3 options)' },
          { version: 'V2', date: '2026-02-08', notes: 'Option B selected, refined typography' },
          { version: 'Final', date: '2026-02-15', notes: 'Client approved — print and digital ready' },
        ],
        comments: [
          { id: 'c-004-1-1', author: 'Dana Lee', authorRole: 'client', content: 'Option B is the clear winner. The negative space feels premium.', timestamp: { x: 50, y: 50 }, createdAt: '2026-02-09 11:00 AM' },
          { id: 'c-004-1-2', author: 'Dana Lee', authorRole: 'client', content: 'Approved!', timestamp: null, createdAt: '2026-02-16 9:00 AM' },
        ],
      },
      {
        id: 'f-004-2',
        name: 'story_template.png',
        type: 'image',
        version: 'Final',
        status: 'approved',
        uploadDate: '2026-02-15',
        url: 'https://placehold.co/1080x1920/f97316/ffffff?text=Story+Template',
        versions: [
          { version: 'Final', date: '2026-02-15', notes: 'Story template — editable Figma version delivered' },
        ],
        comments: [
          { id: 'c-004-2-1', author: 'Dana Lee', authorRole: 'client', content: 'Perfect for our aesthetic. Approved.', timestamp: { x: 50, y: 40 }, createdAt: '2026-02-16 9:02 AM' },
        ],
      },
      {
        id: 'f-004-3',
        name: 'banner_ad.png',
        type: 'image',
        version: 'Final',
        status: 'approved',
        uploadDate: '2026-02-15',
        url: 'https://placehold.co/1200x628/f97316/ffffff?text=Banner+Ad+1200x628',
        versions: [
          { version: 'Final', date: '2026-02-15', notes: '1200x628 Facebook/Instagram ad banner' },
        ],
        comments: [
          { id: 'c-004-3-1', author: 'Priya Sharma', authorRole: 'creator', content: 'Optimized for Google Display Network specs as well.', timestamp: null, createdAt: '2026-02-15 3:00 PM' },
        ],
      },
    ],
  },
  {
    id: 'proj-005',
    name: 'Website Redesign',
    client: 'Bloom Architecture',
    status: 'Draft',
    createdAt: '2026-02-20',
    lastActivity: '5 hours ago',
    reviewToken: 'review-mno345',
    creatorName: 'Theo Walsh',
    files: [
      {
        id: 'f-005-1',
        name: 'wireframes.pdf',
        type: 'document',
        version: 'V1',
        status: 'draft',
        uploadDate: '2026-02-22',
        url: null,
        versions: [
          { version: 'V1', date: '2026-02-22', notes: 'Initial wireframes — 8 key page layouts' },
        ],
        comments: [],
      },
      {
        id: 'f-005-2',
        name: 'homepage_design.png',
        type: 'image',
        version: 'V1',
        status: 'draft',
        uploadDate: '2026-02-22',
        url: 'https://placehold.co/1440x900/f97316/ffffff?text=Homepage+Design+V1',
        versions: [
          { version: 'V1', date: '2026-02-22', notes: 'Hero section and above-fold design' },
        ],
        comments: [],
      },
      {
        id: 'f-005-3',
        name: 'mobile_design.png',
        type: 'image',
        version: 'V1',
        status: 'draft',
        uploadDate: '2026-02-22',
        url: 'https://placehold.co/390x844/f97316/ffffff?text=Mobile+Design+V1',
        versions: [
          { version: 'V1', date: '2026-02-22', notes: 'Mobile responsive breakpoints — 390px' },
        ],
        comments: [],
      },
    ],
  },
  {
    id: 'proj-006',
    name: 'Album Art & Singles',
    client: 'Zara Moon Music',
    status: 'In Review',
    createdAt: '2026-02-12',
    lastActivity: '30 minutes ago',
    reviewToken: 'review-pqr678',
    creatorName: 'Marcus Rivera',
    files: [
      {
        id: 'f-006-1',
        name: 'album_cover.png',
        type: 'image',
        version: 'V2',
        status: 'in-review',
        uploadDate: '2026-02-21',
        url: 'https://placehold.co/3000x3000/f97316/ffffff?text=Album+Cover+V2',
        versions: [
          { version: 'V1', date: '2026-02-14', notes: 'Dark surrealist concept — initial direction' },
          { version: 'V2', date: '2026-02-21', notes: 'Typography layered in, texture pass, final color grade' },
        ],
        comments: [
          { id: 'c-006-1-1', author: 'Zara Moon', authorRole: 'client', content: 'The moon element in the top right needs to be larger. It\'s the whole vibe.', timestamp: { x: 75, y: 20 }, createdAt: '2026-02-22 1:00 AM' },
          { id: 'c-006-1-2', author: 'Zara Moon', authorRole: 'client', content: 'The title font is perfect. Don\'t change it.', timestamp: { x: 50, y: 55 }, createdAt: '2026-02-22 1:05 AM' },
          { id: 'c-006-1-3', author: 'Marcus Rivera', authorRole: 'creator', content: 'On it — scaling the moon up and reworking the composition around it.', timestamp: { x: 75, y: 20 }, createdAt: '2026-02-22 9:00 AM' },
        ],
      },
      {
        id: 'f-006-2',
        name: 'single_1_midnight.mp3',
        type: 'audio',
        version: 'V3',
        status: 'approved',
        uploadDate: '2026-02-20',
        url: '/api/placeholder/audio',
        duration: 213,
        versions: [
          { version: 'V1', date: '2026-02-13', notes: 'Demo recording — rough arrangement' },
          { version: 'V2', date: '2026-02-17', notes: 'Full production — instruments tracked' },
          { version: 'V3', date: '2026-02-20', notes: 'Final mix and master — ready for distribution' },
        ],
        comments: [
          { id: 'c-006-2-1', author: 'Zara Moon', authorRole: 'client', content: 'The intro gives me chills every time. Perfect.', timestamp: 12, createdAt: '2026-02-21 11:00 PM' },
          { id: 'c-006-2-2', author: 'Zara Moon', authorRole: 'client', content: 'Bridge is everything. This is the moment.', timestamp: 98, createdAt: '2026-02-21 11:04 PM' },
          { id: 'c-006-2-3', author: 'Zara Moon', authorRole: 'client', content: 'APPROVED. Release this Friday.', timestamp: null, createdAt: '2026-02-22 12:00 AM' },
        ],
      },
      {
        id: 'f-006-3',
        name: 'single_2_golden.mp3',
        type: 'audio',
        version: 'V2',
        status: 'changes-requested',
        uploadDate: '2026-02-22',
        url: '/api/placeholder/audio',
        duration: 195,
        versions: [
          { version: 'V1', date: '2026-02-18', notes: 'Demo — piano and vocals only' },
          { version: 'V2', date: '2026-02-22', notes: 'Full arrangement added' },
        ],
        comments: [
          { id: 'c-006-3-1', author: 'Zara Moon', authorRole: 'client', content: 'The piano intro is too long. Cut it down to 8 bars max.', timestamp: 0, createdAt: '2026-02-22 2:00 AM' },
          { id: 'c-006-3-2', author: 'Zara Moon', authorRole: 'client', content: 'Everything after the chorus is incredible. Keep from here onward exactly as is.', timestamp: 87, createdAt: '2026-02-22 2:08 AM' },
          { id: 'c-006-3-3', author: 'Marcus Rivera', authorRole: 'creator', content: 'Got it — trimming the intro and rebalancing the mix. Will have V3 by tomorrow.', timestamp: null, createdAt: '2026-02-22 10:00 AM' },
        ],
      },
    ],
  },
];

export function getProjectById(id) {
  return projects.find((p) => p.id === id) || null;
}

export function getProjectByToken(token) {
  return projects.find((p) => p.reviewToken === token) || null;
}

export const statusColors = {
  'In Review': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Approved': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Changes Requested': 'bg-red-50 text-red-700 border border-red-200',
  'Draft': 'bg-gray-50 text-gray-600 border border-gray-200',
  'Locked': 'bg-purple-50 text-purple-700 border border-purple-200',
};

export const fileStatusColors = {
  'draft': 'text-gray-500',
  'in-review': 'text-orange-600',
  'changes-requested': 'text-red-500',
  'approved': 'text-emerald-600',
  'locked': 'text-purple-600',
};

export const fileStatusLabels = {
  'draft': 'Draft',
  'in-review': 'In Review',
  'changes-requested': 'Changes Requested',
  'approved': 'Approved',
  'locked': 'Locked',
};
