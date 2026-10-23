#!/usr/bin/env python3
"""
ArgusCore OSINT Automation Engine - Indian (+91) Telecom & Carrier Recon
Version: v1.0.0
License: MIT
"""
import sys
import re

CIRCLE_MAPPINGS = {
    "9820": ("Mumbai", "Bharti Airtel"),
    "9821": ("Mumbai", "Vodafone Idea (Vi)"),
    "9900": ("Karnataka", "Reliance Jio"),
    "9810": ("Delhi-NCR", "Vodafone Idea (Vi)"),
    "9811": ("Delhi-NCR", "Bharti Airtel"),
    "9444": ("Tamil Nadu", "BSNL India"),
    "9845": ("Karnataka", "Bharti Airtel"),
    "9890": ("Maharashtra & Goa", "Vodafone Idea (Vi)"),
    "9822": ("Maharashtra & Goa", "BSNL India"),
    "9830": ("Kolkata", "Bharti Airtel"),
    "9831": ("Kolkata", "Vodafone Idea (Vi)"),
    "9847": ("Kerala", "BSNL India"),
    "9872": ("Punjab", "Bharti Airtel"),
    "9896": ("Haryana", "Vodafone Idea (Vi)"),
    "9835": ("Bihar & Jharkhand", "Bharti Airtel"),
    "9801": ("Bihar & Jharkhand", "Reliance Jio"),
    "9435": ("Assam", "BSNL India"),
    "9436": ("North East", "BSNL India"),
    "9437": ("Odisha", "BSNL India"),
    "9816": ("Himachal Pradesh", "Bharti Airtel"),
    "9419": ("Jammu & Kashmir", "BSNL India"),
}

def normalize_indian_number(raw):
    cleaned = re.sub(r'\D', '', raw)
    if cleaned.startswith('91') and len(cleaned) == 12:
        cleaned = cleaned[2:]
    elif cleaned.startswith('0') and len(cleaned) == 11:
        cleaned = cleaned[1:]
    return cleaned

def main():
    print("[*] ArgusCore Indian (+91) Telecom Recon Engine v1.0.0")
    if len(sys.argv) < 2:
        print("Usage: python3 phone_recon_india.py <10-digit-indian-number-or-E164>")
        print("Example: python3 phone_recon_india.py 9820123456")
        sys.exit(1)

    raw_input = sys.argv[1]
    num = normalize_indian_number(raw_input)

    if len(num) != 10:
        print(f"[-] Invalid Indian phone number length ({len(num)} digits). Must be 10 digits.")
        sys.exit(1)

    prefix4 = num[:4]
    circle, operator = CIRCLE_MAPPINGS.get(prefix4, ("India General", "Reliance Jio / Airtel / Vi"))

    print(f"\n[+] Raw Input: {raw_input}")
    print(f"[+] Normalized E.164: +91 {num[:5]} {num[5:]}")
    print(f"[+] National Format: 0{num[:5]} {num[5:]}")
    print(f"[+] Country: India (+91)")
    print(f"[+] Telecom Circle (State): {circle}")
    print(f"[+] Original Allocated Operator: {operator}")
    print(f"[+] Mobile Country Code (MCC): 404 / 405 (India)")
    print(f"[+] Timezone: Asia/Kolkata (IST, UTC+5:30)")
    print(f"[!] Note: Mobile Number Portability (MNP) may allow user to switch operators while retaining circle.")

if __name__ == "__main__":
    main()
