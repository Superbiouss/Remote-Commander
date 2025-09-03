# local_server.py
# This is a simple HTTP server that runs on your local PC.
# It listens for requests from the Remote Commander web app to:
# 1. Get the list of available applications.
# 2. Launch a specified application.

import subprocess
import sys
import importlib

# --- Dependency Auto-Installer ---
def install_dependencies():
    """Checks for required packages and installs them if missing."""
    required_packages = {
        "qrcode": "qrcode[pil]", # qrcode with Pillow support
        "netifaces": "netifaces"
    }
    
    for package_name, install_name in required_packages.items():
        try:
            importlib.import_module(package_name)
            print(f"'{package_name}' is already installed.")
        except ImportError:
            print(f"'{package_name}' not found. Installing...")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", install_name])
                print(f"Successfully installed '{package_name}'.")
            except subprocess.CalledProcessError as e:
                print(f"ERROR: Failed to install '{package_name}'.")
                print("Please try installing it manually by running:")
                print(f"pip install {install_name}")
                sys.exit(1)

# Run the dependency check
install_dependencies()
print("\nAll dependencies are satisfied.\n")
# --- End of Dependency Installer ---


import http.server
import socketserver
import json
import os
import platform
import socket
import qrcode
import netifaces

# --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
# --- CONFIGURE YOUR APPS HERE ---
# --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
#
# Add the applications you want to be able to launch.
#
# The KEY is the name that will appear in the web app (e.g., "Google Chrome").
# The VALUE is the command to run the application from your terminal.

# --- DEFAULT CONFIGURATION (edit this) ---
if platform.system() == "Windows":
    APPS = {
        "Notepad": "notepad.exe",
        "Calculator": "calc.exe",
        "Command Prompt": "cmd.exe",
        "Google Chrome": "start chrome",
        "VS Code": "code",
    }
elif platform.system() == "Darwin": # macOS
    APPS = {
        "TextEdit": "open -a TextEdit",
        "Calculator": "open -a Calculator",
        "Terminal": "open -a Terminal",
        "Google Chrome": "open -a 'Google Chrome'",
        "VS Code": "open -a 'Visual Studio Code'",
    }
else: # Linux and others
    APPS = {
        "Text Editor": "gedit", # Or your default text editor like 'kate', 'mousepad'
        "Terminal": "gnome-terminal", # Or 'konsole', 'xterm'
    }
# --- END OF CONFIGURATION ---

PORT = 8000

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == '/apps':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"apps": list(APPS.keys())}
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode('utf-8'))
            app_to_launch = body.get('app')

            if app_to_launch in APPS:
                command = APPS[app_to_launch]
                print(f"Executing command: {command}")
                
                subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {"success": True, "message": f"Launched {app_to_launch} successfully."}
                self.wfile.write(json.dumps(response).encode('utf-8'))
            else:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {"success": False, "message": "App not found in configuration."}
                self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            print(f"Error: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"success": False, "message": f"Server error: {e}"}
            self.wfile.write(json.dumps(response).encode('utf-8'))

def get_local_ip():
    try:
        # Get a list of all network interfaces
        interfaces = netifaces.interfaces()
        for interface in interfaces:
            # Skip loopback and other non-relevant interfaces
            if interface.startswith('lo') or 'Loopback' in interface:
                continue
            
            addrs = netifaces.ifaddresses(interface)
            # Look for IPv4 addresses
            if netifaces.AF_INET in addrs:
                ip_info = addrs[netifaces.AF_INET][0]
                ip_address = ip_info.get('addr')
                # A simple check to filter out non-local IPs, might need adjustment
                if ip_address and not ip_address.startswith('127.'):
                    return ip_address
    except Exception as e:
        print(f"Could not automatically find IP address: {e}")

    # Fallback method if netifaces fails
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


Handler = MyHttpRequestHandler
local_ip = get_local_ip()
server_url = f"http://{local_ip}:{PORT}"

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("\n" + "="*50)
    print("      REMOTE COMMANDER SERVER      ")
    print("="*50)
    print(f"\nServer running at: {server_url}")
    print("Scan the QR code below with the Remote Commander app on your phone.")
    
    # Generate and print QR code to the terminal
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(server_url)
    qr.make(fit=True)
    
    print("\n")
    qr.print_tty()
    print("\n" + "="*50)

    print("\nConfigured Apps:")
    for app_name in APPS:
        print(f"- {app_name}")
    print("\nPress Ctrl+C to stop the server.")
    httpd.serve_forever()
