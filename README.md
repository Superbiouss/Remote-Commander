# Remote Commander

Turn your phone into a remote control for your computer! Remote Commander lets you launch applications on your PC or Mac from anywhere in your house, just by tapping a button on your phone.

![Remote Commander Screenshot](https://storage.googleapis.com/static.aifire.dev/remote-commander-screenshot.png)

## What Can It Do?

*   **Launch Apps Instantly:** Start any program on your computer from your phone's web browser.
*   **Super Simple Connection:** Just scan a QR code from your computer screen to connect your phone. No typing IP addresses!
*   **Works with Wi-Fi or Hotspot:** Use your home Wi-Fi or your phone's personal hotspot to connect.
*   **Organize Your Favorites:** Pin your most-used apps to the top for even quicker access.
*   **Quick Search:** Instantly find the app you're looking for.
*   **Looks Great:** A clean, modern design that even includes a dark mode.

---

## How It Works (In Simple Terms)

For this to work, two pieces of software talk to each other over your local network:

1.  **A Web App:** This is the interface you see and use on your phone's browser.
2.  **A PC Server:** This is a small helper program that runs on your computer. It listens for the "launch" signal from your phone.

As long as your phone and computer are on the same Wi-Fi network (or your computer is connected to your phone's hotspot), they can communicate.

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

#### 2. Choose Your Apps (Optional)

You can decide which apps appear in the remote.

1.  Open the `local_server.py` file you saved earlier with a text editor.
2.  Find the `APPS` section. You can change the list to whatever you want!
    *   The **name in quotes** is what you'll see on your phone (e.g., `"Google Chrome"`).
    *   The **command** is what your computer uses to open the program.

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
4.  The first time you run this, it will automatically download and install the tools it needs.
5.  Success! Your terminal will now show a big **QR code**. Keep this window open.

### Part 2: On Your Phone

Now you'll connect your phone to your computer.

1.  **Start the Web App:**
    *   In the project folder on your computer, open a new terminal and run `npm install` (you only need to do this once), then run `npm run dev`. This starts the web server.

2.  **Find your Computer's IP address**
    *   When you ran `python local_server.py`, it printed the IP address. Look for the line: `Server running at: http://<YOUR_PC_IP>:8000`. It will look something like `http://192.168.1.12:8000`.

3.  **Open the App on your Phone**
    *   Open the web browser on your phone (like Chrome or Safari).
    *   In the address bar, type `http://<YOUR_PC_IP>:9002` (use the IP from the step above, but with port `9002`).
    *   For example: `http://192.168.1.12:9002`

4.  **Scan the QR Code:**
    *   When the app loads, tap the **"Connect"** button, then **"Scan QR Code"**.
    *   Point your phone's camera at the QR code in your computer's terminal.
    *   It will connect instantly!

You are now ready to launch apps from your phone!

---

### No Wi-Fi? Use a Phone Hotspot!

If you're out and about, you can use your phone's hotspot instead of Wi-Fi.

1.  **Enable Hotspot:** Turn on the personal hotspot on your phone.
2.  **Connect Laptop:** Connect your computer to your phone's hotspot network.
3.  **Run Server:** Run the `local_server.py` script on your computer. It will generate a *new* QR code for this new network connection.
4.  **Scan:** Use the app on your phone to scan the new QR code.
