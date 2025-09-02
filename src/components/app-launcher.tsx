"use client";

import { useState, useEffect, useCallback, useMemo, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Settings, Save, Power, Plug, CheckCircle2, Pin, PinOff, GripVertical, WifiOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ICONS, getIcon, type App as AppType } from '@/lib/mock-data';
import { filterAppsAction, launchApp, FormState, getAppsFromPC } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from './ui/label';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const AppCard = ({ app, localServerUrl, isPinned, onPinToggle }: { app: AppType; localServerUrl: string; isPinned: boolean; onPinToggle: (appName: string) => void; }) => {
  const Icon = getIcon(app.icon);
  const initialState: FormState = { success: false, message: "" };
  const [state, formAction] = useActionState(launchApp, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative"
    >
      <Card
        className="h-full w-full overflow-hidden border-2 border-transparent transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary/20"
      >
        <form action={formAction}>
            <input type="hidden" name="appName" value={app.name} />
            <input type="hidden" name="localServerUrl" value={localServerUrl} />
            <LaunchButton icon={Icon} appName={app.name}/>
        </form>
      </Card>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1 right-1 h-8 w-8 rounded-full bg-background/50 text-foreground/70 hover:bg-background hover:text-foreground"
        onClick={() => onPinToggle(app.name)}
      >
        {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
      </Button>
      {isPinned && <GripVertical className="absolute top-1 left-1 h-5 w-5 text-muted-foreground/50" />}
    </motion.div>
  );
};

function LaunchButton({ icon: Icon, appName }: { icon: React.ElementType, appName: string }) {
    const { pending } = useFormStatus();

    return (
        <Button
          type="submit"
          variant="ghost"
          className="h-full w-full p-0"
          disabled={pending}
          aria-disabled={pending}
        >
          <CardContent className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
            {pending ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
              <Icon className="h-10 w-10 text-primary" />
            )}
            <span className="text-center font-medium text-card-foreground">
              {appName}
            </span>
          </CardContent>
        </Button>
    )
}


export default function AppLauncher() {
  const [apps, setApps] = useState<AppType[]>([]);
  const [filteredApps, setFilteredApps] = useState<AppType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [localServerUrl, setLocalServerUrl] = useState('');
  const [tempServerUrl, setTempServerUrl] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pinnedApps, setPinnedApps] = useState<string[]>([]);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { toast } = useToast();

  const appNames = useMemo(() => apps.map(app => app.name), [apps]);

  useEffect(() => {
    const storedUrl = localStorage.getItem('localServerUrl');
    if (storedUrl) {
      setLocalServerUrl(storedUrl);
      setTempServerUrl(storedUrl);
    } else {
        setIsSettingsOpen(true);
    }
    const storedPinnedApps = localStorage.getItem('pinnedApps');
    if(storedPinnedApps) {
        setPinnedApps(JSON.parse(storedPinnedApps));
    }
  }, []);

  const fetchAndSetApps = useCallback(async (url: string) => {
    setIsLoading(true);
    const appNames = await getAppsFromPC(url);
    if (appNames.length > 0) {
      const allIcons = Object.keys(ICONS);
      const fetchedApps: AppType[] = appNames.map((name, index) => ({
        name,
        // Assign icons based on availability or fallback
        icon: allIcons.find(iconName => name.toLowerCase().includes(iconName)) as keyof typeof ICONS || allIcons[index % allIcons.length]
      }));
      setApps(fetchedApps);
    } else if (url) {
        toast({
            title: 'Could not fetch apps',
            description: 'Could not fetch apps from your PC. Make sure the server is running and the URL is correct.',
            variant: 'destructive',
        });
        setApps([]);
    } else {
        setApps([]);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchAndSetApps(localServerUrl);
  }, [localServerUrl, fetchAndSetApps]);

  const sortedAndFilteredApps = useMemo(() => {
    const sortedApps = [...apps].sort((a, b) => {
      const aIsPinned = pinnedApps.includes(a.name);
      const bIsPinned = pinnedApps.includes(b.name);

      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      if (aIsPinned && bIsPinned) {
        return pinnedApps.indexOf(a.name) - pinnedApps.indexOf(b.name);
      }
      return a.name.localeCompare(b.name);
    });

    if (!searchQuery) {
        return sortedApps;
    }
    return filteredApps;
  }, [apps, pinnedApps, searchQuery, filteredApps]);
  

  const handleFilter = useCallback(async (query: string) => {
    if (!query) {
      setFilteredApps(apps);
      return;
    }
    setIsFiltering(true);
    const filteredNames = await filterAppsAction(query, appNames);
    const newFilteredApps = apps.filter(app => filteredNames.includes(app.name));
    setFilteredApps(newFilteredApps);
    setIsFiltering(false);
  }, [appNames, apps]);

  useEffect(() => {
    handleFilter(debouncedSearchQuery);
  }, [debouncedSearchQuery, handleFilter]);


  const handleSaveSettings = () => {
    if (!tempServerUrl) {
        toast({
            title: 'URL is empty',
            description: 'Please enter a URL.',
            variant: 'destructive',
        });
        return;
    }

    try {
        const url = new URL(tempServerUrl.includes('://') ? tempServerUrl : `http://${tempServerUrl}`);
        if(!url.port) url.port = "8000"; // Default port if not provided
        const formattedUrl = url.toString().replace(/\/$/, ''); // remove trailing slash
        
        localStorage.setItem('localServerUrl', formattedUrl);
        setLocalServerUrl(formattedUrl);
        setTempServerUrl(formattedUrl);

        toast({
          title: 'Settings Saved',
          description: `Server URL set to ${formattedUrl}`,
        });
        setIsSettingsOpen(false);
    } catch(e) {
        toast({
            title: 'Invalid URL',
            description: 'Please enter a valid URL (e.g., http://192.168.1.10:8000).',
            variant: 'destructive',
        });
    }
  };

  const togglePin = (appName: string) => {
    const newPinnedApps = pinnedApps.includes(appName)
      ? pinnedApps.filter(name => name !== appName)
      : [...pinnedApps, appName];
    
    setPinnedApps(newPinnedApps);
    localStorage.setItem('pinnedApps', JSON.stringify(newPinnedApps));
  }

  const handleDisconnect = () => {
    localStorage.removeItem('localServerUrl');
    setLocalServerUrl('');
    setTempServerUrl('');
    setApps([]);
    toast({
        title: 'Disconnected',
        description: 'You have been disconnected from the PC server.',
    });
    setIsSettingsOpen(false);
  }

  const isConnected = useMemo(() => !!localServerUrl, [localServerUrl]);

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Power className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Remote Commander
            </h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
                {isConnected ? (
                    <Button variant="secondary" className="border border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20">
                        <CheckCircle2 /> Connected
                    </Button>
                ) : (
                    <Button variant="outline">
                        <Plug /> Connect to PC
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isConnected ? 'Connection Settings' : 'Connect to your PC'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="server-url" className="text-right">
                    Server URL
                  </Label>
                  <Input
                    id="server-url"
                    value={tempServerUrl}
                    onChange={(e) => setTempServerUrl(e.target.value)}
                    className="col-span-3"
                    placeholder="http://<YOUR_PC_IP>:8000"
                  />
                </div>
              </div>
              <DialogFooter>
                 {isConnected && (
                  <Button variant="destructive" onClick={handleDisconnect} className="mr-auto">
                    <WifiOff /> Disconnect
                  </Button>
                )}
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
                <Button onClick={handleSaveSettings}>
                  <Save className="mr-2" /> Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ThemeToggle />
        </div>
      </header>
      
      {!isConnected && (
         <Card className="border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-destructive-foreground">
                    <Settings/> Not Connected to Your PC
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <p className="text-sm text-destructive-foreground/80">
                    To launch apps, open the settings and enter the local server URL of your computer. You can find instructions on how to set up the server in the project's README.
                </p>
            </CardContent>
         </Card>
      )}


      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Use AI to filter apps (e.g., 'design tools' or 'coding')..."
          className="w-full rounded-full bg-background/50 py-6 pl-12 pr-12 text-base shadow-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isFiltering && (
            <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      <main>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {sortedAndFilteredApps.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              >
                {sortedAndFilteredApps.map((app) => (
                  <AppCard key={app.name} app={app} localServerUrl={localServerUrl} isPinned={pinnedApps.includes(app.name)} onPinToggle={togglePin} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center gap-4 py-16 text-center"
              >
                <Search className="h-16 w-16 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold">No Applications Found</h2>
                <p className="text-muted-foreground">
                    {isConnected ? `Your search for "${searchQuery}" did not match any applications.` : "Connect to your PC to see your applications."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
