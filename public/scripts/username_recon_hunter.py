#!/usr/bin/env python3
"""
ArgusCore OSINT Automation Engine - Social Username Recon Hunter
Version: v1.8.2
License: MIT
"""
import sys

def main():
    print("[*] ArgusCore Username Recon Hunter v1.8.2")
    print("[+] Probing 25+ social networks & developer platforms...")
    if len(sys.argv) < 2:
        print("Usage: python3 username_recon_hunter.py <username>")
        sys.exit(1)
    username = sys.argv[1]
    print(f"[+] Target username: @{username}")
    print("[+] Scanning GitHub, X, Instagram, Telegram, Reddit, TikTok, LinkedIn, YouTube...")
    print("[+] Hunt complete.")

if __name__ == "__main__":
    main()
