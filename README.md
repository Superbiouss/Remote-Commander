# Remote Commander

Remote Commander is a web application that allows you to remotely launch applications on your PC from your phone or any other device on the same local network. It provides a simple, clean interface to see your available apps and launch them with a single tap.

![Remote Commander Screenshot](https://storage.googleapis.com/static.aifire.dev/remote-commander-screenshot.png)

## Features

- **Remote Application Launch:** Launch any application on your computer from a web browser.
- **Simple & Clean UI:** A modern, responsive interface built with Next.js and Tailwind CSS.
- **Wi-Fi & Hotspot Support:** Connect via your home Wi-Fi or your phone's personal hotspot for on-the-go access.
- **Pin Favorite Apps:** Pin frequently used applications to the top of the list for quick access.
- **Search:** Quickly find the application you want to launch.
- **Light & Dark Mode:** The UI adapts to your system's theme preference.
- **Zero Configuration (Almost):** Just run a simple Python server on your PC and connect the web app to it.

## How It Works

The project consists of two main parts:

1.  **The Web App (this project):** A Next.js application that provides the user interface. You can host it on a service like Firebase App Hosting or run it locally.
2.  **The Local PC Server:** A simple Python script (`local_server.py`) that runs on your PC. This server listens for HTTP requests from the web app to get the list of apps and launch them.

For the system to work, both the device running the web app (e.g., your phone) and your PC must be on the same local network.

## Getting Started

Follow these steps to set up and run Remote Commander.

### Prerequisites

- **Node.js** (v18 or later) and **npm** for the web application.
- **Python 3** for the local PC server.

### 1. Set Up the Local PC Server

This server runs on the computer where you want to launch applications.

1.  **Save the Server Script:**
    Save the code from `local_server.py` in this project into a file named `local_server.py` on your PC.

2.  **Customize Your Applications (Optional):**
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

3.  **Run the Server:**
    Open a terminal or command prompt on your PC, navigate to the directory where you saved `local_server.py`, and run:
    ```bash
    python local_server.py
    ```
    The server will start and print a message like `Server running on http://0.0.0.0:8000`. Keep this terminal window open.

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
    The app will be running at `http://localhost:9002` (or another port if 9002 is busy).

### 3. Connect the App to Your PC

1.  **Find Your PC's Local IP Address:**
    - **Windows:** Open Command Prompt and type `ipconfig`. Find the "IPv4 Address".
    - **macOS:** Open System Settings > Wi-Fi, click "Details..." on your network, and find the IP address.
    - **Linux:** Open a terminal and type `ip addr show`.

    Your local IP address usually looks like `192.168.1.X`, `10.0.0.X`, or `172.16.X.X`.

2.  **Connect in the Web App:**
    - Open the web app on your phone or in your browser.
    - Click the **"Connect"** button.
    - Enter your PC's server URL, which is your IP address plus the port `8000`. For example: `http://192.168.1.123:8000`.
    - Click **"Save"**.

The app will connect to your PC, and your applications will appear. Now you can launch them with a tap!

## Using a Phone Hotspot (No Wi-Fi)

If you don't have a Wi-Fi network, you can use your phone's personal hotspot.

1.  **Enable Hotspot:** Turn on the hotspot feature on your phone.
2.  **Connect Laptop:** Connect your laptop to your phone's hotspot network.
3.  **Find Laptop's NEW IP:** Your laptop will get a new IP address from your phone. Use `ipconfig` (Windows) or `ifconfig` (macOS/Linux) on your laptop to find this new IP address. It will likely start with `172.20.10.X`.
4.  **Run Server:** Start the `local_server.py` on your laptop as usual.
5.  **Connect App:** In the web app **on your phone**, enter the new IP address and port `8000` (e.g., `http://172.20.10.2:8000`).

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Local PC Server:** Python (`http.server`)
