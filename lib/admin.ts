const ADMIN_EMAILS = ['cole@sweetdreams.us', 'bordeauxcreates@gmail.com']

export function isAdmin(email: string | undefined | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}
