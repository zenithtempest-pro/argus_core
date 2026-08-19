import requests,json,os
try: 
    import pyfiglet
except:
    os.system("pip install pyfiglet")
    import pyfiglet
# phone=input()
red = "\033[1m\033[31m"
green = "\033[1m\033[32m"
yellow = "\033[1m\033[33m"
blue = "\033[1m\033[34m"
cyan = "\033[1m\033[36m"
magenta = "\033[1m\033[35m"
white = "\033[1m\033[37m"
def logo(name):
    banner = pyfiglet.figlet_format(name, font="slant")
    print(f"{green}_______________________________")
    print(f"\033[1m\033[31m{banner}\033[0m") 
    print(f"{yellow}Code Dev: @ankubyte\n")
    print(f"{yellow}Telegram: @ankubyte\n")
    print(f"{yellow}Its a Basic Phone info Tool\n")
    print(f"{green}_______________________________")
 
logo("ankubyte")

def info(phone):
    url=f'https://api-calltracer-eternal.vercel.app/api?number={phone}'
    a=requests.get(url)
    if a.status_code==200:
        b=a.json()
        return b

    else:
        return f'Cant fetch info right now'


while True:
    print(f'{yellow}[+]{yellow}{red}Support only Indian Number\n{yellow}[+]{yellow}{red}Enter Your phone number without country code or q to exit...{white}')
    phone=input(f"{cyan}Enter>> {yellow}").strip()
    if phone.lower()=='q':
        print(f"{blue}Ohk Bye...{white}")
        break
    else:
        res=info(phone)
        print(f'{blue}Here is info related to +91{phone}')
        # print(res)
        for i,j in res.items():
            print(f"{cyan}{i} : {green}{j}{white}")
        print(f"{cyan}Developer : {green}@ankubyte")
        inn=input(f'{red}Do You want to continue? y/n >> {yellow}{white}')
        if inn.lower().strip()=='y':
            continue
        else:
            print(f"{blue}Ohk Byee...{white}")
            break
