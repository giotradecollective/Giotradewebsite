/**
 * GIOTRADE Client Portal — Supabase client + shared auth helpers.
 * Include this on every page AFTER the Supabase SDK script tag.
 */

// ---- Fill these in from: Supabase Dashboard → Project Settings → API ----
const SUPABASE_URL = 'https://ahtjhlspthpakywljmcn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iIzUENQKJZ3_KcoAlI_Eag_Uzdzj-9p';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Human-readable labels
const ROLE_LABELS = {
  administrator: 'Administrator',
  portfolio_manager: 'Portfolio Manager',
  research_analyst: 'Research Analyst',
  investor: 'Investor / Client',
  network_subscriber: 'GIOTRADE Network Subscriber',
  nexgen_student: 'GIOTRADE NexGen Student',
};

/** Login */
async function loginWithPassword(email, password) {
  return supabaseClient.auth.signInWithPassword({
    email,
    password
  });
}

/** Logout */
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'portal.html?notice=logged_out';
}

/** Returns the logged-in investor profile */
async function getCurrentProfile() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) return null;

  const { data, error } = await supabaseClient
    .from('profiles')
    .select(`
      full_name,
      role,
      investor_number,
      portfolio_type,
      advisor,
      phone,
      portfolio_value,
      status
    `)
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return {
    ...data,
    email: session.user.email
  };
}

/** Require login */
async function requireAuth() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'portal.html?error=login_required';
    return null;
  }

  return session;
}

/** Require one of the supplied roles */
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
