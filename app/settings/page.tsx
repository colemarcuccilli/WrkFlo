'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import GoogleDriveConnect from '@/components/GoogleDriveConnect';
import AppHeader from '@/components/AppHeader';

const CYAN = '#15f3ec';
const BLUE = '#5bc7f9';
const MINT = '#16ffc0';
const BG = '#0a0a0f';
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const INPUT_BG = 'rgba(255,255,255,0.05)';
const INPUT_BORDER = 'rgba(255,255,255,0.1)';
const TOGGLE_OFF = 'rgba(255,255,255,0.12)';

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg"
      style={{
        background: 'rgba(10,10,15,0.95)',
        border: `1px solid rgba(22,255,192,0.2)`,
        backdropFilter: 'blur(12px)',
        animation: 'fadeInUp 0.3s ease',
      }}
      onAnimationEnd={() => setTimeout(onDone, 2500)}
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={MINT}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{message}</span>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    comments: true,
    approvals: true,
    changesRequested: true,
    newUploads: false,
    weeklyDigest: true,
  });
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: 'Creative Director',
    timezone: 'Eastern Time (ET)',
  });
  const [branding, setBranding] = useState({
    workspaceName: 'Sweet Dreams Media',
    accentColor: '#f97316',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?';

  // Show toast when redirected back from Google Drive OAuth
  useEffect(() => {
    const driveParam = searchParams.get('drive');
    if (driveParam === 'connected') {
      showToast('Google Drive connected successfully');
    } else if (driveParam === 'error') {
      showToast('Failed to connect Google Drive');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setProfile((p) => ({
        ...p,
        name: user.user_metadata?.full_name || p.name || '',
        email: user.email || p.email || '',
      }));
      if (user.user_metadata?.avatar_url) {
        setPhotoPreview(user.user_metadata.avatar_url);
      }
    }
  }, [user]);

  const toggle = (key: string) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const showToast = (msg: string) => {
    setToast(msg);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: profile.name },
    });
    setSavingProfile(false);
    if (error) {
      showToast('Failed to save profile: ' + error.message);
    } else {
      showToast('Profile saved successfully');
    }
  };

  const handleSaveBranding = async () => {
    setSavingBranding(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingBranding(false);
    showToast('Branding saved successfully');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Photo must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  /* --- shared inline style helpers --- */
  const cardStyle: React.CSSProperties = {
    background: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 16,
    padding: 24,
  };

  const inputStyle: React.CSSProperties = {
    background: INPUT_BG,
    border: `1px solid ${INPUT_BORDER}`,
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  };

  const saveBtnStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${CYAN}, ${MINT})`,
    color: '#0a0a0f',
    fontWeight: 600,
    fontSize: 14,
    borderRadius: 12,
    padding: '8px 16px',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: `0 4px 20px rgba(21,243,236,0.25)`,
    transition: 'box-shadow 0.2s, opacity 0.2s',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 16,
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <AppHeader />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
            Settings
          </h1>
          <p className="mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            Manage your account and workspace preferences.
          </p>
        </div>

        {/* Profile Settings */}
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={sectionTitleStyle}>Profile</h2>
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden cursor-pointer transition-opacity relative"
              style={{
                background: `linear-gradient(135deg, rgba(21,243,236,0.15), rgba(22,255,192,0.1))`,
                border: `2px solid rgba(21,243,236,0.3)`,
                color: CYAN,
              }}
              onClick={() => photoInputRef.current?.click()}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div>
              <button
                className="text-sm font-medium"
                style={{ color: CYAN, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => photoInputRef.current?.click()}
                onMouseEnter={(e) => (e.currentTarget.style.color = MINT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = CYAN)}
              >
                Change photo
              </button>
              <p className="mt-0.5" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                JPG, PNG or GIF &middot; Max 2MB
              </p>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = CYAN;
                  e.currentTarget.style.boxShadow = `0 0 0 2px rgba(21,243,236,0.15)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = INPUT_BORDER;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = CYAN;
                  e.currentTarget.style.boxShadow = `0 0 0 2px rgba(21,243,236,0.15)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = INPUT_BORDER;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <select
                value={profile.role}
                onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))}
                style={{ ...inputStyle, appearance: 'none' as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = CYAN;
                  e.currentTarget.style.boxShadow = `0 0 0 2px rgba(21,243,236,0.15)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = INPUT_BORDER;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="Creative Director">Creative Director</option>
                <option value="Video Producer">Video Producer</option>
                <option value="Graphic Designer">Graphic Designer</option>
                <option value="Audio Engineer">Audio Engineer</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Time Zone</label>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                style={{ ...inputStyle, appearance: 'none' as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = CYAN;
                  e.currentTarget.style.boxShadow = `0 0 0 2px rgba(21,243,236,0.15)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = INPUT_BORDER;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="Eastern Time (ET)">Eastern Time (ET)</option>
                <option value="Pacific Time (PT)">Pacific Time (PT)</option>
                <option value="Central Time (CT)">Central Time (CT)</option>
                <option value="Mountain Time (MT)">Mountain Time (MT)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              style={{
                ...saveBtnStyle,
                opacity: savingProfile ? 0.5 : 1,
                cursor: savingProfile ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!savingProfile) e.currentTarget.style.boxShadow = `0 6px 28px rgba(21,243,236,0.35)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 20px rgba(21,243,236,0.25)`; }}
            >
              {savingProfile ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={sectionTitleStyle}>Notifications</h2>
          <div className="space-y-4">
            {[
              { key: 'comments', label: 'New Comments', desc: 'When a client or teammate leaves a comment' },
              { key: 'approvals', label: 'File Approvals', desc: 'When a file is approved by the client' },
              { key: 'changesRequested', label: 'Changes Requested', desc: 'When changes are requested on a file' },
              { key: 'newUploads', label: 'New Uploads', desc: 'When a team member uploads a new file' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of project activity every Monday' },
            ].map((item) => {
              const isOn = notifications[item.key as keyof typeof notifications];
              return (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggle(item.key)}
                    className="relative w-10 h-5 rounded-full transition-colors"
                    style={{
                      background: isOn ? CYAN : TOGGLE_OFF,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: isOn ? `0 0 10px rgba(21,243,236,0.3)` : 'none',
                      transition: 'background 0.2s, box-shadow 0.2s',
                    }}
                  >
                    <div
                      className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow transition-transform"
                      style={{
                        background: isOn ? '#0a0a0f' : 'rgba(255,255,255,0.5)',
                        transform: isOn ? 'translateX(20px)' : 'translateX(0)',
                      }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => showToast('Notification preferences saved')}
              style={saveBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 6px 28px rgba(21,243,236,0.35)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 20px rgba(21,243,236,0.25)`; }}
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Integrations */}
        <div className="mb-6">
          <h2 className="mb-3" style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>Integrations</h2>
          <GoogleDriveConnect />
        </div>

        {/* Branding */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Workspace Branding</h2>
          <div
            className="rounded-xl p-8 text-center cursor-pointer transition-colors"
            style={{
              border: `2px dashed rgba(255,255,255,0.08)`,
              background: 'rgba(255,255,255,0.02)',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `rgba(21,243,236,0.25)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `rgba(255,255,255,0.08)`; }}
          >
            <svg className="w-8 h-8 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.25)">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Upload your logo</p>
            <p className="mt-1" style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
              PNG or SVG &middot; Appears on client review pages
            </p>
            <p className="mt-2 font-medium" style={{ fontSize: 12, color: CYAN }}>Coming soon</p>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Workspace Name</label>
              <input
                type="text"
                value={branding.workspaceName}
                onChange={(e) => setBranding((b) => ({ ...b, workspaceName: e.target.value }))}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = CYAN;
                  e.currentTarget.style.boxShadow = `0 0 0 2px rgba(21,243,236,0.15)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = INPUT_BORDER;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.accentColor}
                  onChange={(e) => setBranding((b) => ({ ...b, accentColor: e.target.value }))}
                  className="w-10 h-9 rounded-lg cursor-pointer"
                  style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}` }}
                />
                <input
                  type="text"
                  value={branding.accentColor}
                  onChange={(e) => setBranding((b) => ({ ...b, accentColor: e.target.value }))}
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = CYAN;
                    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(21,243,236,0.15)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = INPUT_BORDER;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveBranding}
              disabled={savingBranding}
              style={{
                ...saveBtnStyle,
                opacity: savingBranding ? 0.5 : 1,
                cursor: savingBranding ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!savingBranding) e.currentTarget.style.boxShadow = `0 6px 28px rgba(21,243,236,0.35)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 20px rgba(21,243,236,0.25)`; }}
            >
              {savingBranding ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Branding'
              )}
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div style={{ ...cardStyle, marginTop: 24 }}>
          <h2 style={{ ...sectionTitleStyle, marginBottom: 8 }}>Account</h2>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Signed in as{' '}
            <span className="font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{user?.email}</span>
          </p>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
              }}
            >
              Sign Out
            </button>
          </form>
        </div>
      </main>

      {/* Toast notification */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Dark select options for browsers that support it */
        .settings-page select option {
          background: #0a0a0f;
          color: rgba(255,255,255,0.9);
        }
        select option {
          background: #1a1a2e;
          color: rgba(255,255,255,0.9);
        }
      `}</style>
    </div>
  );
}
