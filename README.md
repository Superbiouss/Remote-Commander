# Remote Commander

Remote Commander is a web application that allows you to remotely launch applications on your PC from your phone or any other device on the same local network. It provides a simple, clean interface to see your available apps and launch them with a single tap.

![Remote Commander Screenshot](https://storage.googleapis.com/static.aifire.dev/remote-commander-screenshot.png)

## Features

- **Easy Connection via QR Code:** Simply scan a QR code from your PC's terminal to connect instantly.
- **Remote Application Launch:** Launch any application on your computer from a web browser.
- **Simple & Clean UI:** A modern, responsive interface built with Next.js and Tailwind CSS.
- **Wi-Fi & Hotspot Support:** Connect via your home Wi-Fi or your phone's personal hotspot for on-the-go access.
- **Pin Favorite Apps:** Pin frequently used applications to the top of the list for quick access.
- **Search:** Quickly find the application you want to launch.
- **Light & Dark Mode:** The UI adapts to your system's theme preference.

## How It Works

The project consists of two main parts:

1.  **The Web App (this project):** A Next.js application that provides the user interface.
2.  **The Local PC Server:** A Python script (`local_server.py`) that runs on your PC. This server listens for HTTP requests from the web app to get the list of apps and launch them.

For the system to work, both the device running the web app (e.g., your phone) and your PC must be on the same local network.

## Getting Started

Follow these steps to set up and run Remote Commander.

### Prerequisites

- **Node.js** (v18 or later) and **npm** for the web application.
- **Python 3** for the local PC server.
- **pip** (Python package installer).

### 1. Set Up the Local PC Server

This server runs on the computer where you want to launch applications.

1.  **Save the Server Script:**
    Save the code from `local_server.py` in this project into a file named `local_server.py` on your PC.

2.  **Install Python Dependencies:**
    The server script requires a few Python packages to generate the QR code and find your local IP address. Open a terminal or command prompt and run:
    ```bash
    pip install qrcode Pillow netifaces
    ```

3.  **Customize Your Applications (Optional):**
    Open the `local_server.py` file and edit the `APPS` dictionary to match the applications you want to control.
    - The **key** is the name that will appear in the web app (e.g., `"Google Chrome"`).
    - The **value** is the exact command used to launch the application from your terminal.

    *Example for Windows:*
    ```python
    APPS = {
        "Google Chrome": "start chrome",
        "VS Code": "code",
        "Notepad": "notepad.exe",
    }
    ```

    *Example for macOS:*
    ```python
    APPS = {
        "Google Chrome": "open -a 'Google Chrome'",
        "VS Code": "open -a 'Visual Studio Code'",
        "Terminal": "open -a Terminal",
    }
    ```

4.  **Run the Server:**
    Navigate to the directory where you saved `local_server.py` and run:
    ```bash
    python local_server.py
    ```
    The server will start, find your local IP address, and display a **QR code** in the terminal. Keep this terminal window open.

### 2. Run the Web Application

1.  **Install Dependencies:**
    In your terminal, navigate to this project's root directory and run:
    ```bash
    npm install
    ```

2.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    The app will be running at `http://localhost:9002`.

### 3. Connect the App to Your PC

1.  Open the web app on your phone.
2.  Click the **"Connect"** button, then click **"Scan QR Code"**.
3.  Allow camera access if prompted.
4.  Point your phone's camera at the QR code displayed in your PC's terminal.
5.  The app will connect automatically!

## Using a Phone Hotspot (No Wi-Fi)

If you don't have a Wi-Fi network, you can still use the app with your phone's hotspot.

1.  **Enable Hotspot:** Turn on the hotspot feature on your phone.
2.  **Connect Laptop:** Connect your laptop to your phone's hotspot network.
3.  **Run Server:** Start the `local_server.py` on your laptop. It will generate a new QR code for the hotspot connection.
4.  **Connect App:** In the web app on your phone, use the "Scan QR Code" feature to scan the new QR code from your laptop's terminal.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **QR Code Scanning:** [react-qr-reader](https://github.com/react-qr-reader/react-qr-reader)
- **Local PC Server:** Python (`http.server`, `qrcode`, `netifaces`)
