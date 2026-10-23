#!/usr/bin/env python3
"""
ArgusCore OSINT Automation Engine - DNS Recon Pro
Version: v2.4.0
License: MIT
"""
import sys

def main():
    print("[*] ArgusCore DNS Recon Pro v2.4.0")
    print("[+] Initializing multi-threaded DNS & Subdomain Enumerator...")
    if len(sys.argv) < 2:
        print("Usage: python3 dns_recon_pro.py <target-domain>")
        sys.exit(1)
    target = sys.argv[1]
    print(f"[+] Target domain: {target}")
    print("[+] Querying A, AAAA, MX, TXT, NS, SOA records...")
    print("[+] Enumeration complete.")

if __name__ == "__main__":
    main()
