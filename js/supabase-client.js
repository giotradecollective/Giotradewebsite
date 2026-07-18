/**
 * GIOTRADE Client Portal — Supabase client + shared auth helpers.
 * Include this on every page AFTER the Supabase SDK script tag, e.g.:
 *
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="js/supabase-client.js"></script>
 */

// ---- Fill these in from: Supabase Dashboard → Project Settings → API ----
const SUPABASE_URL = 'https://ahtjhlspthpakywljmcn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iIzUENQKJZ3_KcoAlI_Eag_Uzdzj-9p';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Human-readable labels for the six roles from the proposal.
const ROLE_LABELS = {
  administrator: 'Administrator',
  portfolio_manager: 'Portfolio Manager',
  research_analyst: 'Research Analyst',
  investor: 'Investor / Client',
  network_subscriber: 'GIOTRADE Network Subscriber',
  nexgen_student: 'GIOTRADE NexGen Student',
};

/** Logs in with email + password. Returns Supabase's { data, error } result. */
async function loginWithPassword(email, password) {
  return supabaseClient.auth.signInWithPassword({ email, password });
}

/** Logs out and returns to the login page. */
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'portal.html?notice=logged_out';
}

/** Returns { full_name, role, email } for the logged-in user, or null if not logged in. */
async function getCurrentProfile() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('full_name, role')
    .eq('id', session.user.id)
    .single();

  if (error || !data) return null;
  return { ...data, email: session.user.email };
}

/**
 * Call at the top of any page that requires login.
 * Redirects to the login page if nobody is signed in.
 * Returns the active session if there is one.
 */
async function requireAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'portal.html?error=login_required';
    return null;
  }
  return session;
}

/**
 * Call at the top of any page that requires a specific role.
 * Example: const profile = await requireRole(['administrator', 'portfolio_manager']);
 */
async function requireRole(allowedRoles) {
  const session = await requireAuth();
  if (!session) return null;

  const profile = await getCurrentProfile();
  if (!profile || !allowedRoles.includes(profile.role)) {
    window.location.href = 'portal.html?error=login_required';
    return null;
  }
  return profile;
}
