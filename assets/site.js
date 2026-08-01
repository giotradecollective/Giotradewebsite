function toggleMobileNav() {
  var panel = document.getElementById('nav-mobile-panel');
  var burger = document.getElementById('nav-burger');
  var isOpen = panel.classList.toggle('is-open');
  burger.classList.toggle('is-open', isOpen);
  burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}
function closeMobileNav() {
  var panel = document.getElementById('nav-mobile-panel');
  var burger = document.getElementById('nav-burger');
  panel.classList.remove('is-open');
  burger.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
function openStoreModal() {
  document.getElementById('store-modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeStoreModal() {
  document.getElementById('store-modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeStoreModal();
});

(function(){
  var STORAGE_KEY = 'giotrade_cookie_consent';
  var banner = document.getElementById('cookie-banner');

  function getConsent(){
    try { return localStorage.getItem(STORAGE_KEY); } catch(e){ return null; }
  }
  function setConsent(value){
    try { localStorage.setItem(STORAGE_KEY, value); } catch(e){}
  }

  if (banner && !getConsent()) {
    banner.classList.add('active');
  }

  window.giotradeCookieAccept = function(){
    setConsent('accepted');
    if (banner) banner.classList.remove('active');
  };

  window.giotradeCookieDecline = function(){
    setConsent('declined');
    if (banner) banner.classList.remove('active');
  };
})();
