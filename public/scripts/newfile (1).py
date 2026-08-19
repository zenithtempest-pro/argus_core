import socket
import urllib.request
import os

R = "\033[91m"   # Red
Y = "\033[93m"   # Yellow
B = "\033[94m"   # Blue
W = "\033[97m"
X = "\033[0m"

banner = f"""
{R}=============================={X}
{Y}      TEAM TEMPEST WELCOME{X}
{B}         Zenith tempest{X}
{R}=============================={X}
"""

while True:
    os.system("cls" if os.name == "nt" else "clear")
    print(banner)

    print(f"{Y}[1]{X} IPv4 Lookup")
    print(f"{Y}[2]{X} IPv6 Lookup")
    print(f"{Y}[3]{X} HTTP / HTTPS Status")
    print(f"{Y}[4]{X} Basic DNS Info")
    print(f"{R}[0]{X} Exit")

    choice = input(f"\n{B}Select Option : {X}")

    if choice == "1":
        domain = input("Domain: ")
        try:
            ip = socket.gethostbyname(domain)
            print(f"\n{R}IPv4:{X} {ip}")
        except:
            print("\nNot Found")

    elif choice == "2":
        domain = input("Domain: ")
        try:
            ipv6 = socket.getaddrinfo(domain, None, socket.AF_INET6)[0][4][0]
            print(f"\n{B}IPv6:{X} {ipv6}")
        except:
            print("\nNot Found")

    elif choice == "3":
        domain = input("Domain: ")

        try:
            r = urllib.request.urlopen(f"http://{domain}", timeout=5)
            print(f"\nHTTP  : ONLINE ({r.status})")
        except:
            print("\nHTTP  : OFFLINE")

        try:
            r = urllib.request.urlopen(f"https://{domain}", timeout=5)
            print(f"HTTPS : ONLINE ({r.status})")
        except:
            print("HTTPS : OFFLINE")

    elif choice == "4":
        domain = input("Domain: ")

        try:
            host = socket.gethostbyname_ex(domain)

            print(f"\n{Y}Host Name:{X} {host[0]}")

            print(f"\n{Y}IP Addresses:{X}")
            for ip in host[2]:
                print(" -", ip)

        except:
            print("\nDNS Info Not Found")

    elif choice == "0":
        print("\nGood Bye!")
        break

    else:
        print("\nInvalid Option!")

    input(f"\n{Y}Press Enter To Continue...{X}")