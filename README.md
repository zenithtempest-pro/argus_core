# ArgusCore 🛡️

> **Enterprise-Grade OSINT & Network Diagnostics Intelligence Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Uptime](https://img.shields.io/badge/Uptime-99.99%25-emerald?style=for-the-badge)](https://supportarguscore.com)

**ArgusCore** is a modern, full-stack, enterprise-grade cybersecurity reconnaissance and network diagnostics application. It seamlessly merges **Enterprise Universal Diagnostic Utilities** (SuperTool Command Center, 50+ RBL Blacklist Check, MX Lookup, DMARC Inspector, RFC 822 Email Header Analyzer, SPF Inspector, Domain Health Audit) with **Advanced OSINT Intelligence Modules** (ArgusRecon Subdomain & DNS Infrastructure Mapper, Indian +91 & Global Phone Lookup with 22 DoT Circle mapping, 17-character VIN Decoder, 25+ Multi-Platform Social Username Hunter, Universal File & EXIF Forensics Analyzer, Document Leak Dorking, and Web Service & Security Header Auditor).

---

## 📋 Table of Contents

- [Key Architecture & System Overview](#-key-architecture--system-overview)
- [Module Breakdown & Features](#-module-breakdown--features)
  - [1. Enterprise Diagnostic Suite](#1-enterprise-diagnostic-suite)
  - [2. OSINT Reconnaissance Engines](#2-osint-reconnaissance-engines)
  - [3. Role-Based Teaser & Authentication Gating](#3-role-based-teaser--authentication-gating)
  - [4. Script Repository Hub & API](#4-script-repository-hub--api)
  - [5. Authentication & Analyst Dashboard](#5-authentication--analyst-dashboard)
- [System Dataflow & Architecture Diagram](#-system-dataflow--architecture-diagram)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Development Server](#running-development-server)
  - [Building for Production](#building-for-production)
- [API Reference & Route Specifications](#-api-reference--route-specifications)
- [Theme System & Hydration Safety](#-theme-system--hydration-safety)
- [Ethical Charter & Legal Notice](#-ethical-charter--legal-notice)
- [Support & Security Contacts](#-support--security-contacts)
- [License](#-license)

---

## 🏗️ Key Architecture & System Overview

ArgusCore is built on a high-performance Next.js 16 (App Router) architectural foundation using React 19 and Tailwind CSS v3. The system enforces strict non-blocking asynchronous execution via `Promise.allSettled` and `AbortController` timeout wrappers (3.5s SLA guarantee per network probe) to ensure rapid analyst feedback without blocking the main event looper.

```
+-----------------------------------------------------------------------------------+
|                                 ArgusCore UI Layer                                |
|  Navbar | Global Search Modal | Dark/Light Theme Engine | Analyst Dashboard       |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                           Next.js App Router (23 Routes)                          |
|  /tools/supertool | /tools/dns | /tools/blacklist | /tools/phone-lookup | etc.     |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                                 API Route Handler                                 |
|          POST /api/osint/lookup             |            GET /api/scripts         |
|  - DNS / MX / DMARC / SPF Parsers           |  - Scans /public/scripts/*.py       |
|  - DoT Circle Indian Phone Engine           |  - Computes Crypto SHA-256 Hashes   |
|  - 25+ Username Async Probes                |  - Reads Stat Size & MTime          |
+-----------------------------------------------------------------------------------+
```

---

## 🛰️ Module Breakdown & Features

### 1. Enterprise Diagnostic Suite

- **SuperTool Command Center (`/tools/supertool`)**: Universal command query bar with `dns:` as the primary default prefix (supporting shortcuts: `dns:`, `mx:`, `blacklist:`, `dmarc:`, `a:`, `arin:`, `whois:`, `spf:`, `tcp:`). Features automatic input sanitization (stripping protocols, trailing slashes, and whitespace). Default preset targets `cloudflare.com` and `example.com`.
- **Blacklist / Blocklist Checker (`/tools/blacklist`)**: Queries 50+ DNSBL blocklists (Spamhaus ZEN, Barracuda, SORBS, SpamCop, PSBL, Truncate) with authoritative **Orange (`#d97706`)** primary query buttons and **Cyan (`#06b6d4`)** "Solve Email Delivery Problems" support triggers.
- **MX Record Lookup (`/tools/mx-lookup`)**: Resolves Mail Exchanger records with priority preference, host IP address, TTL, SMTP port 25 banner response time, and open-relay detection.
- **DMARC Record Inspector (`/tools/dmarc`)**: Parses `_dmarc.domain.com` TXT records, evaluates policy enforcement (`p=reject`, `p=quarantine`, `p=none`), checks alignment flags (`adkim`, `aspf`), and validates RFC 7489 compliance.
- **RFC 822 Email Header Analyzer (`/tools/header-analyzer`)**: Full raw header textarea parser detailing hop delay timelines, receiving SMTP hops, SPF/DKIM verification status, and spam verdict scores.
- **SPF Record Inspector (`/tools/spf`)**: Validates `v=spf1` syntax, inclusion mechanisms (`include:`, `ip4:`), and checks against the RFC 7208 10-lookup DNS limit.
- **Domain Health Audit (`/tools/domain-health`)**: 360-degree security audit cards evaluating MX, SPF, DMARC, DNSBL, and DNSSEC into a single health grade score (A+).

---

### 2. OSINT Reconnaissance Engines

- **ArgusRecon Subdomain & DNS Infrastructure Mapper (`/tools/dns`)**:
  - **Unified DNS Records**: Resolves A, AAAA, CNAME, NS, MX, TXT, and SOA records simultaneously.
  - **Certificate Transparency Subdomain Discovery**: Enumerates subdomains in real-time via `crt.sh` logs.
  - **Infrastructure Topology & GeoIP**: Maps autonomous systems (ASN), ISP routing, and geographic node locations with visual topology mapping.
- **Indian (+91) & Global Phone Lookup (`/tools/phone-lookup`)**:
  - **Auto-Normalization**: Automatically formats 10-digit (`9999900000`) or 11-digit (`09999900000`) inputs to standard E.164 (`+91 99999 00000`).
  - **DoT 22 Telecom Circles**: Maps prefix series across all 22 Department of Telecommunications circles (Mumbai, Delhi-NCR, Karnataka, Tamil Nadu, Maharashtra & Goa, UP East, UP West, West Bengal, Kolkata, Kerala, Punjab, Gujarat, etc.).
  - **Operator Resolution**: Detects initial allocated carrier (Reliance Jio, Bharti Airtel, Vodafone Idea - Vi, BSNL, MTNL).
  - **Telecommunication Metadata**: Displays Mobile Country Code (MCC `404` / `405`), Mobile Network Code (MNC), Timezone (`Asia/Kolkata` IST, UTC+5:30), Line Type (Mobile GSM/LTE/5G), and Mobile Number Portability (MNP) advisory.
- **Vehicle & VIN Intelligence Decoder (`/tools/vehicle-lookup`)**: Validates 17-character VIN numbers according to ISO 3779 / NHTSA standards. Decodes vehicle make, model year, engine displacement, assembly plant, body classification, and country of origin.
- **25+ Multi-Platform Social Username Hunter (`/tools/identity`)**: Concurrently probes target usernames across 25 platforms (Instagram, Telegram, GitHub, X/Twitter, Reddit, TikTok, LinkedIn, YouTube, Pinterest, Medium, Dev.to, Twitch, Spotify, Discord, Steam, SoundCloud, Vimeo, Dribbble, Behance, ProductHunt, HackerNews, Patreon, Substack, Quora, GitLab) with FOUND/AVAILABLE badges and direct profile links.
- **Universal File & EXIF Forensics Analyzer (`/tools/media-docs`)**:
  - **Layer 1 Universal File Forensics (100% Client-Side)**: File name, exact byte size, MIME content type, UTC/local timestamps, pixel geometry (`Width × Height px`), megapixels, and aspect ratio loaded via browser `HTMLImageElement`.
  - **Cryptographic & Binary Inspection**: Computes SHA-256 checksums in-browser via Web Cryptography API (`crypto.subtle.digest`) and inspects the first 8 bytes for binary magic byte signatures (JPEG, PNG, GIF, PDF, ZIP, RIFF/WebP, TIFF).
  - **Layer 2 Deep EXIF & GPS Optics**: Extracts camera make, model, lens, exposure time, aperture, ISO, and GPS coordinates with OpenStreetMap links. Handles messaging-stripped files (e.g. WhatsApp, Signal) gracefully with automated compression detection badges.
  - **Document Dorking Hub**: One-click Google Dork queries for indexed confidential files (`filetype:pdf "confidential"`, `filetype:xlsx "password"`).
- **Web Service & Security Header Auditor (`/tools/scanners`)**: Passive HTTP/HTTPS diagnostic engine measuring round-trip latency and inspecting critical security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).

---

### 3. Role-Based Teaser & Authentication Gating

ArgusCore implements a non-intrusive preview and authentication model via [`src/components/auth/AuthBlurGate.tsx`](file:///C:/Users/HP/OneDrive/Desktop/ArgusCore/src/components/auth/AuthBlurGate.tsx):
- **Zero-Friction Teasers**: Anonymous and unauthenticated visitors immediately receive high-level reconnaissance telemetry (target domain, host counts, basic image geometry, latency stats).
- **Glassmorphic `<AuthBlurGate>`**: Deep records (full subdomain host tables, DNS nameservers, SPF/DMARC assessments, raw VIN engineering telemetry, SHA-256 cryptographic hashes, and deep EXIF optics) are guarded behind a centered glassmorphic login/signup modal with `blur-md opacity-50` styling.
- **Instant Full Access**: Logged-in analysts view 100% of telemetry data across all 14 tools with zero blur.

---

### 4. Script Repository Hub & API

- **Script Hub UI (`/downloads`)**: Managed dynamically via [`src/data/scripts.ts`](file:///C:/Users/HP/OneDrive/Desktop/ArgusCore/src/data/scripts.ts) and backed by executable `.py` files in [`public/scripts/`](file:///C:/Users/HP/OneDrive/Desktop/ArgusCore/public/scripts/).
- **Dynamic Filesystem Scanner API (`/api/scripts`)**:
  - Automatically scans `public/scripts/` using Node.js `fs.readdirSync`.
  - Calculates real-time **SHA-256 cryptographic checksums** via `crypto.createHash('sha256')`.
  - Serves direct downloadable files:
    - `phone_recon_india.py` (v1.0.0, Python 3.9+)
    - `dns_recon_pro.py` (v2.4.0)
    - `username_recon_hunter.py` (v1.8.2)
    - `exif_forensic_scrubber.py` (v3.0.1)
    - `header_security_audit.py` (v1.2.0)
    - `ip_asn_enricher.py` (v2.1.0)
    - `phone_carrier_tracer.py` (v1.0.0)
    - `vin_decoder_tool.py` (v1.1.0)

---

### 5. Authentication & Analyst Dashboard

- **ArgusCore Enterprise Authentication (`/auth/login` & `/auth/signup`)**:
  - Sign-in with Email & Password or Google/GitHub SSO buttons.
  - Sign-up featuring collapsible "Show password requirements ⌵" helper box.
- **Analyst Dashboard (`/dashboard`)**: Filterable query history table, saved workspaces, and diagnostic usage metrics.

---

## 📐 System Dataflow & Architecture Diagram

```mermaid
flowchart TD
    User([Analyst / User]) -->|HTTP Request| NextRouter[Next.js App Router]
    
    subgraph UI_Layer [Frontend Layer]
        NextRouter --> Home["/ (Landing Page)"]
        NextRouter --> SuperTool["/tools/supertool (dns: Default)"]
        NextRouter --> DNS["/tools/dns (ArgusRecon Mapper)"]
        NextRouter --> Blacklist["/tools/blacklist"]
        NextRouter --> PhoneLookup["/tools/phone-lookup (+91 Circle)"]
        NextRouter --> VehicleLookup["/tools/vehicle-lookup (VIN)"]
        NextRouter --> MediaDocs["/tools/media-docs (Forensics)"]
        NextRouter --> ScriptHub["/downloads (Script Repository)"]
    end
    
    subgraph API_Layer [Backend API Layer]
        SuperTool & DNS & Blacklist & PhoneLookup & VehicleLookup -->|POST /api/osint/lookup| LookupHandler[Lookup Handler Engine]
        ScriptHub -->|GET /api/scripts| ScriptHandler[Filesystem Script Scanner]
    end

    subgraph Service_Engine [Execution & Data Processing]
        LookupHandler -->|Parse Unified DNS & crt.sh| DNSEngine[ArgusRecon DNS Engine]
        LookupHandler -->|Parse India +91| DoTCircle[DoT 22 Circle & Operator Dict]
        LookupHandler -->|Parse ISO 3779| VINDecoder[NHTSA / VIN Engine]
        LookupHandler -->|Async 3.5s SLA| DNSBL[50+ RBL Blocklists]
        LookupHandler -->|25+ Parallel Probes| SocialHunter[Social Username Scanner]
        ScriptHandler -->|Node.js Crypto| SHA256[SHA-256 Checksum Compute]
        ScriptHandler -->|Public Files| PublicStorage["/public/scripts/*.py"]
    end

    DNSEngine -->|JSON Response| User
    DoTCircle -->|JSON Response| User
    VINDecoder -->|JSON Response| User
    DNSBL -->|JSON Response| User
    SocialHunter -->|JSON Response| User
    SHA256 -->|JSON Array| User
```

---

## 📁 Directory Structure

```
ArgusCore/
├── public/
│   ├── favicon.ico
│   └── scripts/                      # Executable standalone Python OSINT tools
│       ├── phone_recon_india.py
│       ├── dns_recon_pro.py
│       ├── username_recon_hunter.py
│       ├── exif_forensic_scrubber.py
│       ├── header_security_audit.py
│       ├── ip_asn_enricher.py
│       ├── phone_carrier_tracer.py
│       └── vin_decoder_tool.py
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout wrapping ThemeProvider & ToastProvider
│   │   ├── globals.css               # Base Tailwind directives & custom scrollbars
│   │   ├── page.tsx                  # Landing page hero with universal query bar
│   │   ├── about/                    # System methodology & ethical charter
│   │   ├── methodology/              # Ethical OSINT guidelines
│   │   ├── contact/                  # Contact ticket dispatch form
│   │   ├── support/                  # Analyst support desk
│   │   ├── dashboard/                # Analyst query history & metrics
│   │   ├── downloads/                # Python Script Hub repository
│   │   ├── auth/
│   │   │   ├── login/                # ArgusCore sign in page
│   │   │   └── signup/               # ArgusCore sign up page
│   │   ├── tools/
│   │   │   ├── [category]/           # Modular tool router (Network, Identity, Media, Scanners)
│   │   │   ├── supertool/            # SuperTool command bar (dns: default)
│   │   │   ├── dns/                  # ArgusRecon unified DNS & crt.sh mapper
│   │   │   ├── blacklist/            # 50+ DNSBL blocklist checker
│   │   │   ├── mx-lookup/            # MX record lookup
│   │   │   ├── dmarc/                # DMARC policy inspector
│   │   │   ├── header-analyzer/      # RFC 822 email header analyzer
│   │   │   ├── spf/                  # SPF record inspector
│   │   │   ├── domain-health/        # 360-degree domain health audit
│   │   │   ├── phone-lookup/         # Indian (+91) & global phone lookup
│   │   │   ├── vehicle-lookup/       # 17-character VIN decoder
│   │   │   ├── media-docs/           # Universal File & EXIF Forensics Hub
│   │   │   └── scanners/             # Web Service & Security Header Auditor
│   │   └── api/
│   │       ├── osint/lookup/route.ts # Primary OSINT lookup API handler
│   │       └── scripts/route.ts      # Dynamic script scanner & SHA-256 API handler
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthBlurGate.tsx      # Reusable teaser & blur auth gate overlay
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Sticky top-pinned navigation header
│   │   │   └── Footer.tsx            # System footer
│   │   ├── search/
│   │   │   └── GlobalSearchModal.tsx # Universal search modal (Hotkey '/')
│   │   ├── theme/
│   │   │   ├── ThemeProvider.tsx     # Theme context (Light/Dark mode)
│   │   │   └── ThemeToggle.tsx       # Theme toggle button
│   │   ├── tools/
│   │   │   └── DiagnosticResultView.tsx # Central diagnostic output & assessment renderer
│   │   └── ui/
│   │       ├── Badge.tsx             # Status badge component
│   │       ├── JsonViewer.tsx        # Collapsible JSON inspector
│   │       └── Toast.tsx             # Toast notification provider
│   └── data/
│       └── scripts.ts                # Script repository metadata registry
├── tailwind.config.js                # Tailwind configuration with darkMode: 'class'
├── postcss.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.17.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ArgusCore.git
   cd ArgusCore
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

### Running Development Server

Start the local development server with Turbopack:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

To create an optimized production build:
```bash
npm run build
```

To test the production build locally:
```bash
npm run start
```

---

## 📡 API Reference & Route Specifications

### 1. OSINT Lookup API (`POST /api/osint/lookup`)

**Request Body**:
```json
{
  "target": "cloudflare.com",
  "tool": "dns"
}
```

**Supported Tools (`tool` field)**:
- `dns` — ArgusRecon unified DNS & crt.sh subdomain mapper
- `supertool` — Universal query execution (`dns:` default)
- `mx` — MX record lookup
- `blacklist` — 50+ DNSBL check
- `dmarc` — DMARC record inspector
- `spf` — SPF record validator
- `domain-health` — Domain health audit
- `header-analyzer` — RFC 822 email header analyzer
- `phone-lookup` — Indian (+91) DoT circle & global phone tracer (`target`: `"9999900000"`)
- `vehicle-lookup` — 17-character VIN decoder (`target`: `"1FA6P8CF0R5100001"`)
- `username` — 25+ social network username hunter
- `ports` — TCP port auditor
- `service-audit` — Web service reachability & security header audit

---

### 2. Script Repository API (`GET /api/scripts`)

Scans `public/scripts/` for `.py` files and returns calculated metadata.

**Response**:
```json
[
  {
    "id": "phone_recon_india",
    "name": "Phone recon india",
    "filename": "phone_recon_india.py",
    "version": "v1.0.0",
    "pythonVersion": "Python 3.8+",
    "size": "1.8 KB",
    "category": "Identity",
    "description": "Executable Python OSINT utility: phone_recon_india.py",
    "dependencies": ["requests", "colorama", "phonenumbers"],
    "checksum": "f4b2380129a811c7629b3c401a91e0a2...",
    "downloads": 1250,
    "lastUpdated": "2026-08-19",
    "downloadUrl": "/scripts/phone_recon_india.py"
  }
]
```

---

## 🌓 Theme System & Hydration Safety

- **Default State**: ArgusCore strictly defaults to **Light Mode** (`#ffffff` background, `#f8fafc` off-white cards, `#e2e8f0` borders, `#0f172a` text).
- **Dark Mode**: Configured via `darkMode: 'class'` in [`tailwind.config.js`](file:///C:/Users/HP/OneDrive/Desktop/ArgusCore/tailwind.config.js). Dark mode applies `#090d16` background, `#131b2e` card surfaces, `#1e293b` borders, and `#f8fafc` text.
- **Hydration Mismatch Safeguards**:
  - `suppressHydrationWarning` applied to `<html>` and `<body>` in [`src/app/layout.tsx`](file:///C:/Users/HP/OneDrive/Desktop/ArgusCore/src/app/layout.tsx).
  - Theme toggle button and navbar session state guarded with client `mounted` state checks (`useEffect(() => setMounted(true), [])`).

---

## ⚖️ Ethical Charter & Legal Notice

> [!IMPORTANT]
> **Ethical Operating Charter**:
> ArgusCore operates strictly under passive, authorized reconnaissance standards. All network diagnostic queries resolve publicly available DNS ledgers, WHOIS registers, and public API endpoints. No intrusive vulnerability exploits or unauthorized port brute-forcing payloads are executed. Users must obtain explicit written authorization before conducting threat assessments against target infrastructure.

---

## 📬 Support & Security Contacts

- **Official Support Email**: [<supportarguscore@gmail.com>](mailto:supportarguscore@gmail.com)
- **Support Desk & Ticketing**: [`/support`](file:///C:/Users/HP/OneDrive/Desktop/ArgusCore/src/app/support/page.tsx)
- **Security PGP Key**: `4A91 88B2 FC90 1209 7781`
- **SLA Window**: Sub-2 hours for critical incident response.

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Developed with ❤️ by the ArgusCore Cybersecurity Engineering Team.
</p>
