/**
 * @fileoverview This is the main client component for the Remote Commander application.
 * It manages all the state, user interactions, and renders the entire UI.
 * The 'use client' directive is essential as this component uses React hooks like useState, useEffect, etc.
 */
"use client";

// React and Next.js hooks for state management, effects, and server action handling.
import { useState, useEffect, useCallback, useMemo, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
// Framer Motion for animations.
import { motion, AnimatePresence } from 'framer-motion';
// Icons from the lucide-react library.
import { Search, Loader2, Settings, Save, Power, Plug, CheckCircle2, Pin, PinOff, GripVertical, WifiOff, Smartphone, QrCode } from 'lucide-react';
// Drag and Drop library
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
// Custom hook for showing toast notifications.
import { useToast } from "@/hooks/use-toast";
// QR Code reader
import QrScanner from 'react-qr-scanner';
// App data and icon mapping.
import { ICONS, getIcon, type App as AppType } from '@/lib/mock-data';
// Server actions imported from the actions file.
import { launchApp, FormState, getAppsFromPC, testConnection } from '@/app/actions';
// UI components from the shadcn/ui library.
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

/**
 * AppCard Component
 * Renders a single application card with its icon and launch functionality.
 * This component is now wrapped with Draggable for re-ordering.
 */
const AppCard = ({ app, localServerUrl, isPinned, onPinToggle, index }: { app: AppType; localServerUrl: string; isPinned: boolean; onPinToggle: (appName: string) => void; index: number; }) => {
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
  
  // A pinned app is draggable. A non-pinned app is not.
  const isDraggable = isPinned;

  return (
    <Draggable draggableId={app.name} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`relative ${snapshot.isDragging ? 'shadow-2xl' : ''}`}
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
      )}
    </Draggable>
  );
};


/**
 * LaunchButton Component
 * A dedicated component for the button inside the AppCard.
 * It uses the useFormStatus hook to show a loading spinner while the form (launch action) is pending.
 */
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

/**
 * AppLauncher Component
 * This is the main default export of the file, containing the entire page logic.
 */
export default function AppLauncher() {
  const [apps, setApps] = useState<AppType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [localServerUrl, setLocalServerUrl] = useState('');
  const [tempServerUrl, setTempServerUrl] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [pinnedApps, setPinnedApps] = useState<string[]>([]);
  
  const { toast } = useToast();

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
        try {
          const parsedPinnedApps = JSON.parse(storedPinnedApps);
          if (Array.isArray(parsedPinnedApps)) {
            setPinnedApps(parsedPinnedApps);
          }
        } catch (e) {
          console.error("Failed to parse pinned apps from localStorage", e);
          localStorage.removeItem('pinnedApps');
        }
    }
  }, []);

  const fetchAndSetApps = useCallback(async (url: string) => {
    setIsLoading(true);
    const appNames = await getAppsFromPC(url);
    if (appNames.length > 0) {
      const allIcons = Object.keys(ICONS);
      const fetchedApps: AppType[] = appNames.map((name, index) => ({
        name,
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
    const filtered = searchQuery
        ? apps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : apps;
        
    return filtered.sort((a, b) => {
      const aIsPinned = pinnedApps.includes(a.name);
      const bIsPinned = pinnedApps.includes(b.name);

      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      if (aIsPinned && bIsPinned) {
        return pinnedApps.indexOf(a.name) - pinnedApps.indexOf(b.name);
      }
      return a.name.localeCompare(b.name);
    });
  }, [apps, pinnedApps, searchQuery]);
  
  const saveUrl = (url: string) => {
    localStorage.setItem('localServerUrl', url);
    setLocalServerUrl(url);
    setTempServerUrl(url);
    toast({ title: 'Connected!', description: `Server URL set to ${url}` });
    setIsSettingsOpen(false);
    setIsQRScannerOpen(false);
  }

  const handleSaveSettings = () => {
    if (!tempServerUrl) {
        toast({ title: 'URL is empty', description: 'Please enter a URL.', variant: 'destructive' });
        return;
    }

    try {
        const url = new URL(tempServerUrl.includes('://') ? tempServerUrl : `http://${tempServerUrl}`);
        if(!url.port) url.port = "8000";
        const formattedUrl = url.toString().replace(/\/$/, '');
        saveUrl(formattedUrl);
    } catch(e) {
        toast({ title: 'Invalid URL', description: 'Please enter a valid URL (e.g., http://192.168.1.10:8000).', variant: 'destructive' });
    }
  };
  
  const handleTestConnection = async () => {
    if(!tempServerUrl) {
        toast({ title: 'URL is empty', description: 'Please enter a URL to test.', variant: 'destructive' });
        return;
    }
    const success = await testConnection(tempServerUrl);
    if(success) {
        toast({ title: 'Success!', description: 'Connection to your PC was successful.', variant: 'default' });
    } else {
        toast({ title: 'Connection Failed', description: 'Could not connect to the server. Check the URL and make sure the server is running on your PC.', variant: 'destructive' });
    }
  }

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
    toast({ title: 'Disconnected', description: 'You have been disconnected from the PC server.' });
    setIsSettingsOpen(false);
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    
    const newPinnedApps = Array.from(pinnedApps);
    newPinnedApps.splice(source.index, 1);
    newPinnedApps.splice(destination.index, 0, draggableId);
    
    setPinnedApps(newPinnedApps);
    localStorage.setItem('pinnedApps', JSON.stringify(newPinnedApps));
  };


  const isConnected = useMemo(() => !!localServerUrl, [localServerUrl]);

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8">
      {/* Header Section */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Power className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Remote Commander
            </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Settings Dialog */}
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={`gap-2 ${isConnected ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 hover:text-green-700 dark:hover:text-green-400" : ""}`}>
                  {isConnected ? <CheckCircle2 /> : <Plug />}
                  {isConnected ? "Connected" : "Connect"}
                </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isConnected ? 'Connection Settings' : 'Connect to your PC'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="server-url">
                    Server URL
                  </Label>
                  <Input
                    id="server-url"
                    value={tempServerUrl}
                    onChange={(e) => setTempServerUrl(e.target.value)}
                    placeholder="http://<YOUR_PC_IP>:8000"
                    className="w-full"
                  />
                </div>
                 <Card className="col-span-4 bg-muted/50">
                    <CardHeader className="p-4">
                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                          <Smartphone /> Using a Hotspot?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                       <p>
                        If you don't have Wi-Fi, you can use your phone's hotspot.
                       </p>
                       <ol className="list-decimal pl-5 mt-2 space-y-1">
                          <li>Turn on your phone's hotspot and connect your laptop to it.</li>
                          <li>Run the server on your laptop. It will show a new QR code.</li>
                          <li>Scan that new QR code to connect.</li>
                       </ol>
                    </CardContent>
                </Card>
              </div>
              <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
                 <div className="flex justify-start gap-2">
                    {isConnected && (
                      <Button variant="destructive" onClick={handleDisconnect}>
                        <WifiOff /> Disconnect
                      </Button>
                    )}
                 </div>
                 <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsQRScannerOpen(true)}><QrCode/> Scan QR</Button>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                    <Button onClick={handleSaveSettings}>
                      <Save /> Save
                    </Button>
                 </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* QR Scanner Dialog */}
          <Dialog open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan QR Code</DialogTitle>
                <CardDescription>Point your camera at the QR code displayed in your PC's terminal.</CardDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg">
                <QrScanner
                    onScan={(result: any) => {
                        if (result) {
                            const url = result?.text;
                             if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                                saveUrl(url);
                             } else {
                                toast({
                                    title: 'Invalid QR Code',
                                    description: 'The scanned QR code does not contain a valid URL.',
                                    variant: 'destructive',
                                });
                                setIsQRScannerOpen(false);
                            }
                        }
                    }}
                    onError={(error: any) => {
                        console.info(error);
                    }}
                    constraints={{ video: { facingMode: 'environment' } }}
                    style={{ width: '100%' }}
                />
              </div>
            </DialogContent>
          </Dialog>

          <ThemeToggle />
        </div>
      </header>
      
      {/* "Not Connected" Warning Card */}
      {!isConnected && (
         <Card className="border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <Settings/> Not Connected to Your PC
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive-foreground/80">
                    To launch apps, click the "Connect" button and scan the QR code from your computer's terminal.
                </p>
            </CardContent>
         </Card>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for an app..."
          className="w-full rounded-full bg-background/50 py-6 pl-12 pr-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Content Area (App Grid or Loading/Empty State) */}
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
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="app-grid" direction="horizontal">
                  {(provided) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      layout
                      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    >
                      {sortedAndFilteredApps.map((app, index) => (
                        <AppCard 
                          key={app.name} 
                          app={app} 
                          localServerUrl={localServerUrl} 
                          isPinned={pinnedApps.includes(app.name)} 
                          onPinToggle={togglePin}
                          index={index}
                        />
                      ))}
                      {provided.placeholder}
                    </motion.div>
                  )}
                </Droppable>
              </DragDropContext>
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
