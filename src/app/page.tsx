/**
 * @fileoverview This is the main page of the application (the route '/').
 * It serves as the entry point and renders the primary component.
 */
import AppLauncher from '@/components/app-launcher';

/**
 * The Home component for the main page.
 * It simply renders the AppLauncher component, which contains all the application logic.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppLauncher />
    </div>
  );
}
