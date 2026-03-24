'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import GoogleDriveConnect from '@/components/GoogleDriveConnect';
import DropboxConnect from '@/components/DropboxConnect';
import OneDriveConnect from '@/components/OneDriveConnect';
import AppHeader from '@/components/AppHeader';

const CYAN = '#15f3ec';
const MINT = '#16ffc0';
const BG = '#0a0a0f';
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const INPUT_BG = 'rgba(255,255,255,0.05)';
const INPUT_BORDER = 'rgba(255,255,255,0.1)';

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
  const [profile, setProfile] = useState({
    name: '',
    email: '',
  });
  const [toast, setToast] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const searchParams = useSearchParams();

  // Show toast when redirected back from OAuth
  useEffect(() => {
    const driveParam = searchParams.get('drive');
    if (driveParam === 'connected') showToast('Google Drive connected successfully');
    else if (driveParam === 'error') showToast('Failed to connect Google Drive');

    const dropboxParam = searchParams.get('dropbox');
    if (dropboxParam === 'connected') showToast('Dropbox connected successfully');
    else if (dropboxParam === 'error') showToast('Failed to connect Dropbox');

    const onedriveParam = searchParams.get('onedrive');
    if (onedriveParam === 'connected') showToast('OneDrive connected successfully');
    else if (onedriveParam === 'error') showToast('Failed to connect OneDrive');
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

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
            Manage your account and connected services.
          </p>
        </div>

        {/* Profile Settings */}
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={sectionTitleStyle}>Profile</h2>
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
                readOnly
                style={{ ...inputStyle, opacity: 0.6, cursor: 'default' }}
              />
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

        {/* Cloud Storage */}
        <div className="mb-6">
          <h2 className="mb-3" style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>Cloud Storage</h2>
          <p className="mb-4" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            Connect your cloud storage to import files directly into projects.
          </p>
          <div className="space-y-3">
            <GoogleDriveConnect />
            <DropboxConnect />
            <OneDriveConnect />
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
      `}</style>
    </div>
  );
}
