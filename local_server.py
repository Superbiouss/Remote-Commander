# local_server.py
# This is a simple HTTP server that runs on your local PC.
# It listens for requests from the Remote Commander web app to:
# 1. Get the list of available applications.
# 2. Launch a specified application.

import http.server
import socketserver
import json
import os
import platform
import subprocess

# --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
# --- CONFIGURE YOUR APPS HERE ---
# --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
#
# Add the applications you want to be able to launch.
#
# The KEY is the name that will appear in the web app (e.g., "Google Chrome").
# The VALUE is the command to run the application from your terminal.
#
# --- Examples for macOS ---
# APPS = {
#     "Google Chrome": "open -a 'Google Chrome'",
#     "Visual Studio Code": "open -a 'Visual Studio Code'",
#     "Spotify": "open -a Spotify",
#     "Terminal": "open -a Terminal",
# }
#
# --- Examples for Windows ---
# APPS = {
#     "Google Chrome": "start chrome",
#     "VS Code": "code",
#     "Notepad": "notepad.exe",
#     "Task Manager": "taskmgr",
# }
#
# --- Examples for Linux ---
# APPS = {
#     "Firefox": "firefox",
#     "Terminal": "gnome-terminal", # or 'konsole', 'xterm', etc.
#     "Files": "nautilus",
# }

# --- DEFAULT CONFIGURATION (edit this) ---
if platform.system() == "Windows":
    APPS = {
        "Notepad": "notepad.exe",
        "Calculator": "calc.exe",
        "Command Prompt": "cmd.exe",
    }
elif platform.system() == "Darwin": # macOS
    APPS = {
        "TextEdit": "open -a TextEdit",
        "Calculator": "open -a Calculator",
        "Terminal": "open -a Terminal",
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
                
                # Use subprocess.Popen for non-blocking command execution
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


Handler = MyHttpRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running on http://0.0.0.0:{PORT}")
    print("This server listens for commands from the Remote Commander web app.")
    print("Make sure your phone and this PC are on the same network.")
    print("\nConfigured Apps:")
    for app_name in APPS:
        print(f"- {app_name}")
    print("\nPress Ctrl+C to stop the server.")
    httpd.serve_forever()
