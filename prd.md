# Product Requirements Document (PRD)
**Project Name:** ArgusCore Intelligence Platform  
**Target Environment:** Antigravity IDE (Gemini 3.6 Flash / Full-Stack Web Architecture)  
**Document Version:** 1.0.0  

---

## 1. Executive Summary & Objective
ArgusCore is a unified, multi-page Open-Source Intelligence (OSINT) and cybersecurity investigation portal. It provides analysts, researchers, and security practitioners with a suite of web-based investigative utilities (DNS, Domain, IP, Social Media, Metadata, Network/Nmap utilities), a centralized script/tool download repository, user authentication, interactive history dashboards, and integrated support channels.

---

## 2. Design System & UI/UX Guidelines
* **Color Palette:** Pure White (`#FFFFFF`), Off-White/Light Gray background surfaces (`#F8FAFC`, `#F1F5F9`), Neutral Slate borders (`#E2E8F0`), Crisp Charcoal text (`#0F172A`, `#334155`), and subtle Royal Blue/Indigo interactive accents (`#2563EB`).
* **Design Anti-Patterns (Explicitly Prohibited):** No dark navy backgrounds, no neon glow effects, no terminal-style neon green/cyan styling, and no monospaced fonts for general UI text.
* **Typography:** Clean, high-legibility modern sans-serif fonts (`Inter`, `Plus Jakarta Sans`, or `Geist Sans`).
* **Component Styling:** Subtle drop shadows (`0 1px 3px rgba(0,0,0,0.05)`), soft rounded corners (`rounded-lg` / `8px-12px`), distinct tabular layouts, and clear status badges.

---

## 3. Information Architecture & Multi-Page Structure
ArgusCore Web Application
├── / (Home / Landing Page)
│   ├── Unified Quick-Search Bar
│   ├── Platform Overview & Architecture Explanation ("How It Works")
│   └── Categorized Tool Directory
├── /auth/login (Authentication Page)
│   ├── Tab 1: Passwordless Magic Link / Email Login
│   └── Tab 2: Standard Username & Password Login
├── /dashboard (User Hub)
│   ├── Recent Search Activity & Query History
│   ├── Saved Investigation Workspaces
│   └── API & Download Usage Metrics
├── /tools (Investigative Modules)
│   ├── /tools/network (DNS, Domain Whois, Reverse IP, Subdomains)
│   ├── /tools/identity (Username Search across Socials, Email Breach Lookup)
│   ├── /tools/media-docs (Image Reverse, Metadata/EXIF Extraction, Doc Dorking)
│   └── /tools/scanners (Nmap Port Scan wrapper, Header Inspector)
├── /downloads (Script & Tool Repository)
│   ├── Python OSINT Tool Library (CLI utilities, scrapers, payloads)
│   ├── Tool metadata, dependencies, checksums (SHA-256), and direct downloads
├── /about (About & Methodology)
├── /contact (Support, Feedback, & Contact Form)


---

## 4. Feature Specifications

### 4.1. Authentication & User Management
* **Dual Login Flows:**
  * **Option A (Email-Only):** One-time passcode (OTP) or magic link token verification.
  * **Option B (Standard):** Username/Password with salt-hashed storage and JWT session management.
* **Role-Based Access:** Anonymous visitors (restricted demo access), Authenticated users (full tool execution, download repository access, query history saving).

### 4.2. Core OSINT & Reconnaissance Tool Engine
* **Network & Infrastructure:**
  * *DNS Lookup:* A, AAAA, MX, TXT, NS, SOA, and CNAME records.
  * *Domain/Whois:* Registrar data, expiration dates, nameservers.
  * *IP Intelligence:* Geolocation coordinates, ISP, ASN, reverse DNS resolution.
  * *Network Utility/Nmap Module:* Common service/port checking (HTTP, HTTPS, SSH, FTP, SMTP, DNS) with sanitized target validation.
* **Identity & Social Footprint:**
  * *Username Recon:* Multi-platform username scanner (Instagram, Telegram, GitHub, Reddit, X/Twitter, etc.) returning HTTP profile status and links.
  * *Email Recon:* Format validation, MX deliverability check, domain association.
* **Media, Documents & Geospatial:**
  * *Metadata Extraction:* Upload parser for EXIF/IPTC image data and document metadata.
  * *Google Dork Generator:* Quick-select document query builders (`filetype:pdf`, `filetype:xlsx`, indexed directories).
  * *Geospatial Links:* Quick coordinates-to-map routing (OpenStreetMap / Google Maps).

### 4.3. Script & Tools Download Hub
* Dedicated table layout listing verified Python scripts, automation tools, and OSINT utilities.
* Each entry displays: Tool Name, Version, Python Version compatibility, Dependencies list (`requirements.txt`), File Size, and Direct Download button.

### 4.4. Analytics Dashboard
* Metric cards: Total Queries Executed, Active Investigations, Tools Downloaded.
* Data table of past query logs with timestamps, input targets, tool types, and one-click re-run buttons.

### 4.5. Help, Support & About Ecosystem
* Step-by-step explanatory section on responsible reconnaissance workflows and ethical guidelines.
* Support modal/page with ticketing, direct email contact trigger, and live system status indicators.

---

## 5. Technical Stack Recommendations
* **Frontend:** Next.js (App Router) / React with Tailwind CSS and Lucide React icons.
* **Backend:** Next.js API Routes or standalone Python (FastAPI) for native tool execution (`dnspython`, `python-whois`, `aiohttp`, `nmap` wrapper).
* **Security Constraints:** Rate limiting on scan endpoints, input sanitization to prevent SSRF and command injection, strict target-domain verification.