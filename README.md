# QR Voice-to-WhatsApp Ordering Web App 🎙️📲

A lightweight, mobile-first web app that enables customers to scan a QR code at a store counter or online, record their order list by voice in **Tamil**, **English**, or **Tanglish**, view a clean bilingual itemized list, and send it directly to the merchant's WhatsApp in one tap via `wa.me`.

---

## ✨ Features Built

1. **Frictionless QR Code Access:**
   - No login, app installation, or user registration needed.
   - Built-in dynamic **QR Code Generator & Printable poster** so merchants can print and display their shop's QR code immediately.

2. **Bilingual Speech-to-Text (Tamil & English):**
   - Uses the browser's native **HTML5 Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`).
   - Supports **Tamil (`ta-IN`)**, **English (`en-IN`)**, and mixed **Tanglish**.
   - Real-time live audio waveform visualizer (using Web Audio API + HTML5 Canvas).
   - Live transcription preview bubble while speaking.

3. **Smart Item & Quantity Parser:**
   - Automatically detects Tamil fractions (`அரை` = 1/2, `கால்` = 1/4, `முக்கால்` = 3/4) and spoken numbers (`ஒன்று`, `இரண்டு`, `five`, `10`).
   - Auto-extracts common units (`kg`, `gram`, `packet`, `litre`, `bottle`, `bunch`, `nos`).
   - Built-in bilingual retail vocabulary covering everyday groceries and provisions with dual Tamil & English naming.
   - Manual item input for typing additional items.

4. **Zero-Cost WhatsApp Redirection:**
   - Leverages `https://wa.me/{phone}?text={encoded}` click-to-chat URL scheme.
   - 100% free with **zero Meta API fees**, zero developer verification, and zero server maintenance.
   - Generates a neat, formatted message with store name, order date/time, customer details, and item breakdown.

5. **Merchant Settings & Local Order History:**
   - Store settings modal (Store Name, WhatsApp phone number with country code, default language).
   - Saved persistently in browser `localStorage`.
   - Local order history tab to track past submitted orders.

---

## 🚀 Quick Start / How to Run Locally

You can test the app directly with any local static HTTP server (e.g. Python, Node.js `serve`, or VS Code Live Server):

### Option A: Using Python (Built-in)
```bash
cd voice-order
python3 -m http.server 3000
```
Then open your mobile browser or desktop browser at:
`http://localhost:3000`

> **Note on Microphone Permissions:** 
> Browsers require **HTTPS** (or `localhost`) to enable microphone access. When deploying to production, ensure HTTPS is active (Vercel, Netlify, and GitHub Pages enable HTTPS by default).

---

## 🌐 Free Deployment Options

### 1. Vercel (Recommended)
1. Push this directory to GitHub or run `npx vercel` inside `voice-order/`.
2. Vercel automatically deploys with a fast global CDN and free SSL/HTTPS.

### 2. GitHub Pages
1. Go to repository Settings > Pages.
2. Select branch and point to the `voice-order` folder or root.
3. Access at `https://<username>.github.io/<repo>/voice-order`.

### 3. Netlify
1. Drag and drop the `voice-order` folder into [app.netlify.com/drop](https://app.netlify.com/drop).
2. It goes live instantly with HTTPS and custom domain support.

---

## ⚙️ Configuration

1. Tap the **⚙️ (Settings)** icon in the top right.
2. Enter your **Shop Name** (e.g., `Sri Murugan Stores`).
3. Enter your **WhatsApp Number** including country code (e.g., `919876543210` for India).
4. Select your preferred default language.
5. Tap **சேமி (Save Settings)**.
6. Tap the **QR Code icon** to view, print, or share your shop's ordering link.
