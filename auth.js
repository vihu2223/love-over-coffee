import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_COOLDOWN_SEC = 30;

const cfg = window.__SUPABASE_CONFIG__ || {};
const url = (cfg.url || "").trim();
const anonKey = (cfg.anonKey || "").trim();
const isConfigured = Boolean(url && anonKey);

let supabase = null;
if (isConfigured) {
  supabase = createClient(url, anonKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      flowType: "pkce",
    },
  });
}

const dialog = document.getElementById("auth-dialog");
const openBtn = document.getElementById("auth-open-btn");
const closeBtn = dialog?.querySelector(".auth-close");
const banner = document.getElementById("auth-not-configured");
const errEl = document.getElementById("auth-error");
const okEl = document.getElementById("auth-success");
const viewGuest = document.getElementById("auth-view-guest");
const viewUser = document.getElementById("auth-view-user");
const userEmailEl = document.getElementById("auth-user-email");
const signOutBtn = document.getElementById("auth-signout");
const formSignin = document.getElementById("form-signin");
const formSignup = document.getElementById("form-signup");
const tabs = dialog?.querySelectorAll(".auth-tab");
const titleEl = dialog?.querySelector("#auth-dialog-title");
const resendWrap = document.getElementById("auth-resend-wrap");
const resendEmailEl = document.getElementById("auth-resend-email");
const resendBtn = document.getElementById("auth-resend-btn");
const resendLink = document.getElementById("auth-resend-link");
const emailHelp = document.getElementById("auth-email-help");
const redirectHint = document.getElementById("auth-redirect-hint");

let resendTimerId = null;
let resendSecondsLeft = 0;
let pendingConfirmEmail = "";

function getEmailRedirectTo() {
  const dir = new URL(".", window.location.href).href;
  return dir.endsWith("/") ? dir : `${dir}/`;
}

function getRedirectUrlsForSupabase() {
  const base = getEmailRedirectTo();
  const origin = window.location.origin;
  return [base, origin + "/", origin + window.location.pathname].filter(
    (v, i, a) => a.indexOf(v) === i
  );
}

function updateRedirectHint() {
  if (redirectHint) {
    redirectHint.textContent = getEmailRedirectTo();
  }
}

function formatAuthError(error) {
  if (!error) return "Something went wrong.";
  const msg = error.message || String(error);
  if (msg.toLowerCase().includes("rate limit")) {
    return `${msg} Wait a few minutes, then use Resend confirmation.`;
  }
  if (msg.toLowerCase().includes("redirect")) {
    return `${msg} Add this URL in Supabase → Authentication → URL Configuration → Redirect URLs: ${getEmailRedirectTo()}`;
  }
  return msg;
}

function isUnconfirmedError(error) {
  const msg = (error?.message || "").toLowerCase();
  return (
    msg.includes("confirm") ||
    msg.includes("verified") ||
    msg.includes("not confirmed") ||
    error?.code === "email_not_confirmed"
  );
}

function showError(msg) {
  if (!errEl) return;
  errEl.textContent = msg || "";
  errEl.hidden = !msg;
  if (okEl) okEl.hidden = true;
}

function showSuccess(msg) {
  if (!okEl) return;
  okEl.textContent = msg || "";
  okEl.hidden = !msg;
  if (errEl) errEl.hidden = true;
}

function clearMessages() {
  showError("");
  showSuccess("");
}

function setActiveTab(which) {
  tabs?.forEach((t) => {
    const on = t.getAttribute("data-tab") === which;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on ? "true" : "false");
  });
  formSignin?.classList.toggle("active", which === "signin");
  formSignup?.classList.toggle("active", which === "signup");
  if (titleEl) {
    titleEl.textContent = which === "signin" ? "Welcome back" : "Create an account";
  }
}

function updateNav(session) {
  if (!openBtn) return;
  if (session?.user?.email) {
    const local = session.user.email.split("@")[0];
    openBtn.textContent = local.length > 12 ? `${local.slice(0, 12)}…` : local;
    openBtn.setAttribute("aria-label", `Account menu, signed in as ${session.user.email}`);
  } else {
    openBtn.textContent = "Sign In";
    openBtn.setAttribute("aria-label", "Sign in or create an account");
  }
}

function clearResendCooldown() {
  if (resendTimerId) {
    clearInterval(resendTimerId);
    resendTimerId = null;
  }
  resendSecondsLeft = 0;
}

function updateResendBtnLabel() {
  if (!resendBtn) return;
  if (resendSecondsLeft > 0) {
    resendBtn.textContent = `Resend confirmation (${resendSecondsLeft}s)`;
    resendBtn.disabled = true;
  } else {
    resendBtn.textContent = "Resend confirmation email";
    resendBtn.disabled = false;
  }
}

function startResendCooldown(seconds = RESEND_COOLDOWN_SEC) {
  clearResendCooldown();
  resendSecondsLeft = seconds;
  updateResendBtnLabel();
  if (resendSecondsLeft <= 0) return;

  resendTimerId = setInterval(() => {
    resendSecondsLeft -= 1;
    updateResendBtnLabel();
    if (resendSecondsLeft <= 0) {
      clearResendCooldown();
      updateResendBtnLabel();
    }
  }, 1000);
}

function showEmailHelp() {
  updateRedirectHint();
  emailHelp?.removeAttribute("hidden");
}

function hideEmailHelp() {
  emailHelp?.setAttribute("hidden", "");
}

function hideResendPanel() {
  resendWrap?.setAttribute("hidden", "");
  pendingConfirmEmail = "";
}

function showResendPanel(email) {
  pendingConfirmEmail = email;
  if (resendEmailEl) resendEmailEl.textContent = email;
  resendWrap?.removeAttribute("hidden");
  showEmailHelp();
  startResendCooldown(RESEND_COOLDOWN_SEC);
}

function getEmailFromForms() {
  const activeForm = formSignup?.classList.contains("active") ? formSignup : formSignin;
  const fd = new FormData(activeForm || formSignin || formSignup);
  return String(fd.get("email") || pendingConfirmEmail || "").trim();
}

async function resendConfirmationEmail(email) {
  if (!isConfigured || !supabase) {
    showError("Configure Supabase in supabase-config.js first.");
    return;
  }
  if (!email) {
    showError("Enter your email address first.");
    return;
  }
  if (resendSecondsLeft > 0) return;

  resendBtn.disabled = true;
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: getEmailRedirectTo(),
    },
  });

  if (error) {
    showError(formatAuthError(error));
    updateResendBtnLabel();
    return;
  }

  showSuccess(
    "If your Supabase project can send mail, a new confirmation email was requested. Check Spam and Promotions. Wait 30s before resending again."
  );
  startResendCooldown(RESEND_COOLDOWN_SEC);
}

function showGuestView() {
  viewGuest?.removeAttribute("hidden");
  viewUser?.setAttribute("hidden", "");
  if (banner) banner.hidden = isConfigured;
}

function showUserView(email) {
  viewGuest?.setAttribute("hidden", "");
  viewUser?.removeAttribute("hidden");
  hideResendPanel();
  hideEmailHelp();
  if (userEmailEl) userEmailEl.textContent = email;
  if (banner) banner.hidden = true;
}

async function openDialog(keepMessages = false) {
  if (!dialog) return;
  if (!keepMessages) {
    clearMessages();
  }
  updateRedirectHint();
  if (!isConfigured) {
    showGuestView();
  } else if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      showUserView(session.user.email);
    } else {
      showGuestView();
    }
  }
  dialog.showModal();
}

function closeDialog() {
  dialog?.close();
}

function handleSignupResponse(data, email) {
  const user = data?.user;
  const session = data?.session;

  if (session) {
    hideResendPanel();
    hideEmailHelp();
    showSuccess("Account ready — you are signed in (email confirmation is off in Supabase).");
    setTimeout(() => closeDialog(), 1200);
    return;
  }

  if (!user) {
    showError("Sign up did not complete. Check Supabase → Logs → Auth.");
    return;
  }

  const identities = user.identities ?? [];
  if (identities.length === 0) {
    showResendPanel(email);
    showError(
      "This email is already registered. Sign in, or resend confirmation if you never verified."
    );
    return;
  }

  showResendPanel(email);
  showSuccess(
    "Sign-up recorded. If email does not arrive within 5 minutes, fix Supabase URL/SMTP settings below and use Resend."
  );
}

async function initAuthOnLoad() {
  if (!supabase) return;

  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash || "";
  const fromEmailLink =
    params.has("code") ||
    hash.includes("access_token") ||
    hash.includes("type=signup") ||
    hash.includes("type=recovery");

  if (fromEmailLink) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn("Auth callback:", error.message);
    }
    if (session?.user?.email) {
      updateNav(session);
      showSuccess(`Email confirmed. Welcome, ${session.user.email.split("@")[0]}!`);
      window.history.replaceState({}, document.title, window.location.pathname);
      openDialog(true);
      showUserView(session.user.email);
      return;
    }
  }

  supabase.auth.getSession().then(({ data: { session } }) => updateNav(session));
}

openBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  openDialog();
});

closeBtn?.addEventListener("click", () => closeDialog());

dialog?.addEventListener("click", (e) => {
  if (e.target === dialog) closeDialog();
});

dialog?.addEventListener("close", () => {
  formSignin?.reset();
  formSignup?.reset();
  clearMessages();
  hideResendPanel();
  hideEmailHelp();
  clearResendCooldown();
});

tabs?.forEach((tab) => {
  tab.addEventListener("click", () => {
    clearMessages();
    setActiveTab(tab.getAttribute("data-tab") || "signin");
  });
});

resendBtn?.addEventListener("click", () => {
  resendConfirmationEmail(pendingConfirmEmail || getEmailFromForms());
});

resendLink?.addEventListener("click", () => {
  const email = getEmailFromForms();
  if (!email) {
    showError("Enter the email you used to sign up, then try again.");
    return;
  }
  showResendPanel(email);
  showSuccess("Use the button below to resend. Wait 30 seconds between attempts.");
});

formSignin?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  if (!isConfigured || !supabase) {
    showError("Configure Supabase in supabase-config.js first.");
    return;
  }
  const fd = new FormData(formSignin);
  const email = String(fd.get("email") || "").trim();
  const password = String(fd.get("password") || "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showError(formatAuthError(error));
    if (isUnconfirmedError(error)) {
      showResendPanel(email);
    }
    return;
  }
  hideResendPanel();
  hideEmailHelp();
  closeDialog();
});

formSignup?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  hideEmailHelp();
  if (!isConfigured || !supabase) {
    showError("Configure Supabase in supabase-config.js first.");
    return;
  }
  const fd = new FormData(formSignup);
  const email = String(fd.get("email") || "").trim();
  const password = String(fd.get("password") || "");
  const confirm = String(fd.get("confirm") || "");
  if (password !== confirm) {
    showError("Passwords do not match.");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getEmailRedirectTo(),
    },
  });

  if (error) {
    showError(formatAuthError(error));
    showEmailHelp();
    return;
  }

  handleSignupResponse(data, email);
});

signOutBtn?.addEventListener("click", async () => {
  if (!supabase) return;
  clearMessages();
  await supabase.auth.signOut();
  showGuestView();
  setActiveTab("signin");
  closeDialog();
});

if (isConfigured && supabase) {
  initAuthOnLoad();
  supabase.auth.onAuthStateChange((event, session) => {
    updateNav(session);
    if (event === "SIGNED_IN" && session?.user?.email) {
      hideResendPanel();
      hideEmailHelp();
    }
  });
}

updateRedirectHint();
