# **App Name**: Remote Commander

## Core Features:

- App Listing: Fetches and displays a list of applications from the user's laptop.
- App Launching: Launches the selected application on the user's laptop via API call POST http://<laptop-ip>:5000/launch with { 'app': '<name>' }.
- Dynamic Filtering: Dynamically filter the app list using tool, driven by AI.
- Search Functionality: Allows users to search for specific applications within the displayed list.
- Light/Dark Mode: Toggles between light and dark color schemes for user preference.
- Loading States: Shows loading animations or skeleton screens while fetching app data.
- Error Handling: Displays user-friendly error messages for API call failures.

## Style Guidelines:

- Primary color: Deep purple (#6750A4) to convey a sense of control and sophistication.
- Background color: Dark gray (#121212) for a modern, minimal look (dark scheme).
- Accent color: Electric violet (#CF94DA) to highlight interactive elements.
- Font: 'Inter', a grotesque-style sans-serif for a modern, neutral, machined look, used for both headlines and body text.
- Responsive grid layout using cards with rounded corners, smooth shadows, and consistent spacing.
- Use consistent, clean icons from 'lucide-react' for app actions and status indicators.
- Employ subtle animations using 'framer-motion' for transitions and micro-interactions.