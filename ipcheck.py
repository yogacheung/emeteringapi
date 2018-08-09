try: #python3
    from urllib.request import urlopen
except: #python2
    from urllib2 import urlopen
import socket
def get_ip_address():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    return s.getsockname()[0]

def getserial():
  # Extract serial from cpuinfo file
  cpuserial = "0000000000000000"
  try:
    f = open('/proc/cpuinfo','r')
    for line in f:
      if line[0:6]=='Serial':
        cpuserial = line[10:26]
    f.close()
  except:
    cpuserial = "ERROR000000000"
 
  return cpuserial
  
external_ip = urlopen('https://v4.ident.me').read().decode('utf8')

print(getserial())
print(external_ip)
print(get_ip_address())