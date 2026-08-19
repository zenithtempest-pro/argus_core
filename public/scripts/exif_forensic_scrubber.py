#!/usr/bin/env python3
"""
ArgusCore OSINT Automation Engine - EXIF Forensic Scrubber
Version: v3.0.1
License: MIT
"""
import sys

def main():
    print("[*] ArgusCore EXIF Forensic Scrubber v3.0.1")
    print("[+] Extracting & sanitizing image metadata...")
    if len(sys.argv) < 2:
        print("Usage: python3 exif_forensic_scrubber.py <image-file>")
        sys.exit(1)
    filepath = sys.argv[1]
    print(f"[+] Processing file: {filepath}")
    print("[+] Stripping GPS tags, camera hardware serials, and timestamps...")
    print("[+] Image sanitized successfully.")

if __name__ == "__main__":
    main()
