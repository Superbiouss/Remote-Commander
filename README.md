# Remote Commander

Turn your phone into a remote control for your computer! Remote Commander lets you launch applications on your PC or Mac from anywhere in your house, just by tapping a button on your phone.

![Remote Commander Screenshot](https://storage.googleapis.com/static.aifire.dev/remote-commander-screenshot.png)

## Core Features

*   **Instant App Launch:** Start any program on your computer from your phone's web browser.
*   **Seamless QR Code Connection:** Simply scan a QR code from your computer screen to connect your phone. No more typing IP addresses!
*   **Works on Any Local Network:** Use your home Wi-Fi or your phone's personal hotspot to connect.
*   **App Pinning & Reordering:** Pin your most-used apps to the top for quick access and reorder them with drag-and-drop.
*   **Customizable App Groups:** Organize your applications into collapsible categories like "Work," "Gaming," or "Utilities."
*   **Quick Search:** Instantly find the app you're looking for with a dynamic search bar.
*   **Modern, Responsive UI:** A clean interface that works beautifully in both portrait and landscape mode, with a dark mode option.

---

## How It Works

For this to work, two pieces of software talk to each other over your local network:

1.  **The Web App:** This is the interface you see and use on your phone's browser, built with Next.js and React.
2.  **The Local Server:** This is a small Python helper program that runs on your computer. It listens for the "launch" signal from your phone and executes the commands.

As long as your phone and computer are on the same Wi-Fi network (or your computer is connected to your phone's hotspot), they can communicate seamlessly.

---

## Getting Started: A Step-by-Step Guide

Follow these two parts to get set up. It's easier than it looks!

### Part 1: On Your Computer

This sets up the helper program that will receive signals from your phone.

#### 1. Save the Helper Program

First, you need to save the server code.

1.  Open a plain text editor (like **Notepad** on Windows or **TextEdit** on Mac).
2.  Copy all the code from the `local_server.py` file in this project.
3.  Paste it into your text editor and save the file as `local_server.py` in a folder you can easily find, like your Desktop.

#### 2. Configure Your Apps (Optional but Recommended!)

You can decide which apps appear in the remote.

1.  Open the `local_server.py` file you just saved with a text editor.
2.  Find the section labeled `--- 1. CONFIGURE YOUR APPS HERE ---`. You can change the list to whatever you want!
    *   You can create **groups** (like `"Work"`, `"Gaming"`).
    *   The **`name`** is what you'll see on your phone (e.g., `"Google Chrome"`).
    *   The **`command`** is what your computer uses to open the program.
    *   The **`icon`** is the picture for the app (see the list of available icons below).

    **Example for Windows:**
    ```python
    APPS = {
        "Work": [
            {"name": "VS Code", "command": "code", "icon": "code"},
            {"name": "Notepad", "command": "notepad.exe", "icon": "fileText"},
        ],
        "Browser": [
            {"name": "Google Chrome", "command": "start chrome", "icon": "chrome"},
        ]
    }
    ```

    **Example for macOS:**
    ```python
    APPS = {
        "Work": [
            {"name": "VS Code", "command": "open -a 'Visual Studio Code'", "icon": "code"},
            {"name": "Terminal", "command": "open -a Terminal", "icon": "terminal"},
        ],
        "General": [
            {"name": "Calculator", "command": "open -a Calculator", "icon": "calculator"}
        ]
    }
    ```

#### 3. Run the Helper Program

Now it's time to start the server!

1.  Open your computer's command line tool:
    *   **Windows:** Press the Windows key, type `cmd`, and press Enter.
    *   **Mac:** Open Launchpad or Spotlight search, type `Terminal`, and press Enter.
2.  In the terminal, navigate to the folder where you saved the file. For example, if it's on your Desktop, you can type `cd Desktop` and press Enter.
3.  Run the server by typing this command and pressing Enter:
    ```bash
    python local_server.py
    ```
4.  The first time you run this, it will automatically download and install the required libraries (`qrcode`, `Pillow`, and `netifaces`).
5.  **Success!** Your terminal will now show a big **QR code**. Keep this window open.

### Part 2: On Your Phone

Now you'll connect your phone to your computer.

1.  **Start the Web App Server:**
    *   In the project folder on your computer, open a **new** terminal.
    *   Run `npm install` to install the web app dependencies (you only need to do this once).
    *   Run `npm run dev`. This starts the web server.

2.  **Find your Computer's IP Address**
    *   When you ran `npm run dev`, it probably printed a "Network" URL like `http://<YOUR_PC_IP>:9002`. This is the address you need.
    *   Alternatively, the Python script you ran earlier also prints this out. Look for the line: `Server running at: http://<YOUR_PC_IP>:8000`.

3.  **Open the App on your Phone**
    *   Open the web browser on your phone (like Chrome or Safari).
    *   In the address bar, type `http://<YOUR_PC_IP>:9002` (use the IP from the step above, but with port `9002`).
    *   For example: `http://192.168.1.12:9002`

4.  **Scan the QR Code:**
    *   When the app loads, tap the **"Connect"** button, then **"Scan QR Code"**.
    *   Point your phone's camera at the QR code in your computer's terminal.
    *   It will connect instantly! You are now ready to launch apps from your phone.

---

### Using a Phone Hotspot

If you don't have Wi-Fi, you can use your phone's personal hotspot instead.

1.  **Enable Hotspot:** Turn on the personal hotspot on your phone.
2.  **Connect Laptop:** Connect your computer to your phone's hotspot network.
3.  **Run Server:** Run the `local_server.py` script on your computer. It will generate a *new* QR code for this new network connection.
4.  **Scan:** Use the app on your phone to scan the new QR code.

---

### Available Icons

When configuring your apps in `local_server.py`, you can use any of the following values for the `icon` field. If you don't specify one, an icon will be picked automatically.

- `code`
- `terminal`
- `chrome`
- `figma`
- `bot`
- `fileText`
- `gitBranch`
- `mic`
- `music`
- `camera`
- `calculator`
- `gamepad2`
- `folder`
- `image`
- `mail`
