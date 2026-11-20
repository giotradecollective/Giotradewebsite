// Biometric (passkey) helper. Needs supabaseClient (js/supabase-client.js)
// and the SimpleWebAuthn browser bundle loaded before this file.
const Biometric = (() => {
  async function call(body) {
    const { data, error } = await supabaseClient.functions.invoke('super-task', { body });
    if (error) throw error;
    if (data && data.error) throw new Error(data.error);
    return data;
  }

  async function available() {
    if (!window.PublicKeyCredential) return false;
    try { if (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) return true; }
    catch (e) {}
    return /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  }

  async function enroll() {
    const { options, challengeId } = await call({ action: 'register-options' });
    const response = await SimpleWebAuthnBrowser.startRegistration(options);
    const ua = navigator.userAgent;
    const deviceName = /iPhone|iPad|iPod/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android phone' : 'This device';
    await call({ action: 'register-verify', challengeId, response, deviceName });
  }

  async function login() {
    const { options, challengeId } = await call({ action: 'login-options' });
    const response = await SimpleWebAuthnBrowser.startAuthentication(options);
    const { token_hash } = await call({ action: 'login-verify', challengeId, response });
    const { error } = await supabaseClient.auth.verifyOtp({ token_hash, type: 'magiclink' });
    if (error) throw error;
  }

  return { available, enroll, login };
})();
