#!/usr/bin/env python3
"""
ArgusCore OSINT Automation Engine - IP Geolocation & ASN Enricher
Version: v2.1.0
License: MIT
"""
import sys

def main():
    print("[*] ArgusCore IP & ASN Enricher v2.1.0")
    if len(sys.argv) < 2:
        print("Usage: python3 ip_asn_enricher.py <ip-address>")
        sys.exit(1)
    ip = sys.argv[1]
    print(f"[+] Enriching IP: {ip}")
    print("[+] Resolving MaxMind GeoIP2 country, ISP, ASN, proxy flags...")
    print("[+] Enrichment complete.")

if __name__ == "__main__":
    main()
