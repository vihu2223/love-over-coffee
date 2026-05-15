import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cfg = window.__SUPABASE_CONFIG__ || {};
const url = (cfg.url || "").trim();
const anonKey = (cfg.anonKey || "").trim();
const isConfigured = Boolean(url && anonKey);

let supabase = null;
if (isConfigured) {
  supabase = createClient(url, anonKey);
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

function showGuestView() {
  viewGuest?.removeAttribute("hidden");
  viewUser?.setAttribute("hidden", "");
  if (banner) banner.hidden = isConfigured;
}

function showUserView(email) {
  viewGuest?.setAttribute("hidden", "");
  viewUser?.removeAttribute("hidden");
  if (userEmailEl) userEmailEl.textContent = email;
  if (banner) banner.hidden = true;
}

async function openDialog() {
  if (!dialog) return;
  clearMessages();
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
});

tabs?.forEach((tab) => {
  tab.addEventListener("click", () => {
    clearMessages();
    setActiveTab(tab.getAttribute("data-tab") || "signin");
  });
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
    showError(error.message);
    return;
  }
  closeDialog();
});

formSignup?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
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
      // Directory of the current page (works for subpaths e.g. github.io/repo/). Must be allowed in Supabase Redirect URLs.
      emailRedirectTo: new URL(".", window.location.href).href,
    },
  });
  if (error) {
    showError(error.message);
    return;
  }
  if (data.user && !data.session) {
    showSuccess("Check your email to confirm your account, then sign in.");
  } else {
    closeDialog();
  }
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
  supabase.auth.getSession().then(({ data: { session } }) => updateNav(session));
  supabase.auth.onAuthStateChange((_event, session) => {
    updateNav(session);
  });
}
