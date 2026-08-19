import socket
import urllib.request
import json

# ===== COLOR =====
R = "\033[91m"
G = "\033[92m"
Y = "\033[93m"
B = "\033[94m"
W = "\033[0m"

# ===== BANNER =====
def banner():
    print(R + """
========================================
        TEAM TEMPEST CYBER ATTACK
        SIMPLE OSINT TOOL v1
========================================
""" + W)

# ===== IP LOOKUP =====
def ip_lookup(domain):
    try:
        ip = socket.gethostbyname(domain)
        print(G + f"[+] Domain: {domain}")
        print(G + f"[+] IP Address: {ip}" + W)
        return ip
    except:
        print(R + "[-] Invalid domain or no response" + W)
        return None

# ===== HTTP HEADERS =====
def headers(domain):
    try:
        url = "http://" + domain
        req = urllib.request.urlopen(url, timeout=5)
        print(Y + "\n[+] HTTP HEADERS:\n" + W)
        for k, v in req.getheaders():
            print(f"{k}: {v}")
    except:
        print(R + "[-] Could not fetch headers (site may block HTTP)" + W)

# ===== BASIC PORT CHECK =====
def port_check(ip):
    print(B + "\n[+] Checking common ports...\n" + W)
    ports = [21, 22, 80, 443, 3306]
    for port in ports:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1)
        result = s.connect_ex((ip, port))
        if result == 0:
            print(G + f"[OPEN] Port {port}" + W)
        else:
            print(R + f"[CLOSED] Port {port}" + W)
        s.close()

# ===== MAIN =====
def main():
    banner()
    target = input("Enter Domain (example.com): ")

    ip = ip_lookup(target)
    if ip:
        headers(target)
        port_check(ip)

if __name__ == "__main__":
    main()