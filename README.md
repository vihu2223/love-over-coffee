# ☕ Love Over Coffee

Welcome to **Love Over Coffee**! A beautifully crafted, modern, and highly responsive landing page designed for a premium coffee shop experience.

## ✨ Features

- **Stunning UI/UX:** Built with modern design principles including glassmorphism, dynamic gradients, and custom CSS art.
- **Fully Responsive:** Flawless layout across Desktop, Tablet, and Mobile devices.
- **Hero Section:** Engaging parallax-style overlapping elements that catch the eye instantly.
- **"About Stores" Collage:** A CSS Grid-powered masonry photo collage showcasing the coffee shop experience.
- **Customer Choices Gallery:** Progressive blur masks and elegant typography.
- **Premium Footer:** Features a stylized subscription bar and CSS-rotated decorative elements.

## 🛠️ Technologies Used

- **HTML5:** Semantic and accessible page structure.
- **CSS3:** Advanced vanilla CSS (Flexbox, CSS Grid, Backdrop Filters, Media Queries, Custom Pseudo-elements).
- **Google Fonts:** Utilizing `Quicksand` for clean body text and `Shalimar` for elegant script accents.
- **Supabase Auth (optional):** Email sign-in and sign-up via the Supabase JavaScript client (loaded from a CDN in `auth.js`).

## 🔐 Sign in / Sign up

Authentication uses [Supabase](https://supabase.com/) so you do not need your own server for accounts.

1. Create a free project at [supabase.com](https://supabase.com/dashboard).
2. In the dashboard, open **Project Settings → API** and copy the **Project URL** and the **anon public** key.
3. Paste them into `supabase-config.js` as `url` and `anonKey`.
4. In **Authentication → Providers**, ensure **Email** is enabled (it is by default).
5. **Authentication → URL Configuration** (required for sign-up confirmation on your real site):
   - Set **Site URL** to your live site, e.g. `https://yourdomain.com` (not `localhost` if you are testing production email).
   - Under **Redirect URLs**, add every URL users may return to after clicking the email link, for example:
     - `https://yourdomain.com`
     - `https://yourdomain.com/`
     - If the site lives in a subfolder (e.g. GitHub Pages): `https://you.github.io/repo-name/` and `https://you.github.io/repo-name/index.html` if needed.
   - The app sends `emailRedirectTo` to the folder of the page where they signed up; that exact URL (with or without trailing slash) must be allowed—add both variants if Supabase rejects the link.
6. If email confirmation is required for new users, check the inbox (and **spam**) for the confirmation message. Supabase’s built-in email is rate-limited and can be delayed; for production, consider **Authentication → SMTP Settings** with your own provider (Resend, SendGrid, etc.).
7. To test without email: **Authentication → Providers → Email** and temporarily turn off **Confirm email** (only for development).

Treat the anon key as public (it is safe in the browser with Row Level Security on your tables). Never expose the **service role** key in front-end code.

### Confirmation link opens the wrong site or shows “redirect_uri_mismatch”

Your **Site URL** or **Redirect URLs** in Supabase do not include the URL in the confirmation email. Update URL Configuration as in step 5, redeploy, then sign up again (or resend confirmation from the dashboard if available).

## 🚀 Getting Started

Simply download or clone the repository and open `index.html` in your favorite web browser! No local server or build tools required.

```bash
git clone https://github.com/vihu2223/love-over-coffee.git
```

## 📸 Preview :

<img width="399" height="390" alt="Screenshot 2026-05-10 at 02 12 04" src="https://github.com/user-attachments/assets/ab7fd03d-a13d-410d-8a3f-807640dacbc6" />
<img width="399" height="461" alt="Screenshot 2026-05-10 at 02 12 16" src="https://github.com/user-attachments/assets/06acbcdf-f663-4adc-8a5c-3f0a24db50a4" />


---
*Crafted with ❤️ and a lot of coffee.*
