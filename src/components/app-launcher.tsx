/**
 * @fileoverview This is the main client component for the Remote Commander application.
 * It manages all the state, user interactions, and renders the entire UI.
 * The 'use client' directive is essential as this component uses React hooks like useState, useEffect, etc.
 */
"use client";

// React and Next.js hooks for state management, effects, and server action handling.
import { useState, useEffect, useCallback, useMemo, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
// Framer Motion for animations.
import { motion, AnimatePresence } from 'framer-motion';
// Icons from the lucide-react library.
import { Search, Loader2, Settings, Save, Power, Plug, CheckCircle2, Pin, PinOff, GripVertical, WifiOff, Smartphone, QrCode, XCircle, Info, CameraOff } from 'lucide-react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  DialogClose,
  DialogDescription
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
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (state.message) {
      const isSuccess = state.success;
      toast({
        title: isSuccess ? 'Success' : 'Error',
        description: state.message,
        variant: isSuccess ? 'default' : 'destructive',
      });
      setStatus(isSuccess ? 'success' : 'error');
      // Reset the icon after a short delay
      const timer = setTimeout(() => setStatus('idle'), 2000);
      return () => clearTimeout(timer);
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
                <LaunchButton icon={Icon} appName={app.name} status={status} />
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
function LaunchButton({ icon: Icon, appName, status }: { icon: React.ElementType, appName: string, status: 'idle' | 'success' | 'error' }) {
    const { pending } = useFormStatus();

    const renderIcon = () => {
        if(pending) return <Loader2 className="h-8 w-8 animate-spin text-primary sm:h-10 sm:w-10" />;
        if(status === 'success') return <CheckCircle2 className="h-8 w-8 text-green-500 sm:h-10 sm:w-10" />;
        if(status === 'error') return <XCircle className="h-8 w-8 text-destructive sm:h-10 sm:w-10" />;
        return <Icon className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
    }

    return (
        <Button
          type="submit"
          variant="ghost"
          className="h-full w-full p-0"
          disabled={pending || status !== 'idle'}
          aria-disabled={pending || status !== 'idle'}
        >
          <CardContent className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 sm:gap-4 sm:p-6">
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={status}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderIcon()}
                </motion.div>
            </AnimatePresence>
            <span className="text-center text-xs font-medium text-card-foreground sm:text-sm">
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
  const [appsByGroup, setAppsByGroup] = useState<Record<string, AppType[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [localServerUrl, setLocalServerUrl] = useState('');
  const [tempServerUrl, setTempServerUrl] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [pinnedApps, setPinnedApps] = useState<string[]>([]);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  
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
    const fetchedAppsByGroup = await getAppsFromPC(url);

    if (Object.keys(fetchedAppsByGroup).length > 0) {
      const allIcons = Object.keys(ICONS);
      const processedApps: Record<string, AppType[]> = {};
      let iconIndex = 0;
      
      for(const group in fetchedAppsByGroup) {
          processedApps[group] = fetchedAppsByGroup[group].map(app => {
              const iconName = app.icon || allIcons.find(iconName => app.name.toLowerCase().includes(iconName)) || allIcons[iconIndex % allIcons.length];
              iconIndex++;
              return { ...app, icon: iconName as keyof typeof ICONS };
          });
      }

      setAppsByGroup(processedApps);
      // Automatically open all groups by default
      setOpenGroups(Object.keys(processedApps));

    } else if (url) {
        toast({
            title: 'Could not fetch apps',
            description: 'Could not fetch apps from your PC. Make sure the server is running and the URL is correct.',
            variant: 'destructive',
        });
        setAppsByGroup({});
    } else {
        setAppsByGroup({});
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchAndSetApps(localServerUrl);
  }, [localServerUrl, fetchAndSetApps]);

  const allApps = useMemo(() => Object.values(appsByGroup).flat(), [appsByGroup]);

  const sortedAndFilteredApps = useMemo(() => {
    const filtered = searchQuery
      ? allApps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : allApps;
    
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
  }, [allApps, pinnedApps, searchQuery]);
  
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
    setAppsByGroup({});
    toast({ title: 'Disconnected', description: 'You have been disconnected from the PC server.' });
    setIsSettingsOpen(false);
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    // We only care about drags within the "Pinned" group
    if (!destination || destination.droppableId !== 'Pinned' || source.droppableId !== 'Pinned') {
      return;
    }
    
    const newPinnedApps = Array.from(pinnedApps);
    const [reorderedItem] = newPinnedApps.splice(source.index, 1);
    newPinnedApps.splice(destination.index, 0, reorderedItem);
    
    setPinnedApps(newPinnedApps);
    localStorage.setItem('pinnedApps', JSON.stringify(newPinnedApps));
  };


  const isConnected = useMemo(() => !!localServerUrl, [localServerUrl]);

  const displayedGroups = useMemo(() => {
    const groups: Record<string, AppType[]> = {};

    const pinned = allApps.filter(app => pinnedApps.includes(app.name))
                          .sort((a,b) => pinnedApps.indexOf(a.name) - pinnedApps.indexOf(b.name));
    
    if(pinned.length > 0) {
      groups['Pinned'] = pinned;
    }

    for (const groupName in appsByGroup) {
      const unpinnedApps = appsByGroup[groupName].filter(app => !pinnedApps.includes(app.name));
      if(unpinnedApps.length > 0) {
        if (!groups[groupName]) {
            groups[groupName] = [];
        }
        groups[groupName].push(...unpinnedApps);
        groups[groupName].sort((a, b) => a.name.localeCompare(b.name));
      }
    }
    return groups;
  }, [allApps, appsByGroup, pinnedApps]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return null;
    return sortedAndFilteredApps;
  }, [searchQuery, sortedAndFilteredApps]);

  useEffect(() => {
    if (!isQRScannerOpen) return;

    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }

  }, [isQRScannerOpen]);


  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-4 px-4 py-4 sm:gap-8 sm:py-8">
      {/* Header Section */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
            <Power className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
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
                 <DialogDescription>
                    Enter your PC's server address below or scan the QR code from the terminal.
                </DialogDescription>
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
                 <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="hotspot-info">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Smartphone /> Using a Hotspot?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card className="col-span-4 bg-muted/50 border-none">
                          <CardContent className="p-4 pt-4 text-sm text-muted-foreground">
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              <DialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-between sm:w-full">
                 <div className="col-span-2 flex justify-start sm:col-auto">
                    {isConnected && (
                      <Button variant="destructive" onClick={handleDisconnect} className="w-full sm:w-auto">
                        <WifiOff /> Disconnect
                      </Button>
                    )}
                 </div>
                 <div className="col-span-2 grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsQRScannerOpen(true)} className="col-span-1"><QrCode/></Button>
                    <DialogClose asChild className="col-span-1">
                      <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                    <Button onClick={handleSaveSettings} className="col-span-1">
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
                <DialogDescription>Point your camera at the QR code displayed in your PC's terminal.</DialogDescription>
              </DialogHeader>
                <div className="overflow-hidden rounded-lg aspect-square bg-muted flex items-center justify-center">
                {hasCameraPermission === false ? (
                    <Alert variant="destructive" className="w-auto">
                        <CameraOff className="h-4 w-4" />
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>
                            Please grant camera permission in your browser settings to use the QR scanner.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <QrScanner
                        onScan={(result: { text: string } | null) => {
                            if (result && result.text) {
                                const url = result.text;
                                if (url.startsWith('http://') || url.startsWith('https://')) {
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
                            console.info('QR Scan Error:', error);
                        }}
                        constraints={{ video: { facingMode: 'environment' } }}
                        style={{ width: '100%' }}
                    />
                )}
              </div>
            </DialogContent>
          </Dialog>

          <ThemeToggle />
        </div>
      </header>
      
      {/* "Not Connected" Warning Card */}
      {!isConnected && (
         <Card className="border-destructive bg-destructive/10">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <Settings/> Not Connected to Your PC
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <p className="text-destructive-foreground/80">
                    To launch apps, click the "Connect" button and scan the QR code from your computer's terminal.
                </p>
            </CardContent>
         </Card>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:h-5 sm:w-5" />
        <Input
          type="search"
          placeholder="Search for an app..."
          className="w-full rounded-full bg-background/50 py-5 pl-10 pr-10 sm:py-6 sm:pl-12 sm:pr-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Content Area (App Grid or Loading/Empty State) */}
      <main>
        {isLoading ? (
          <div className="space-y-4">
             {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-8 w-1/3 rounded-lg mb-4" />
                    <div className="grid grid-cols-2 gap-4 landscape:grid-cols-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {Array.from({ length: 4 }).map((_, j) => (
                        <Skeleton key={j} className="aspect-square w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            ))}
          </div>
        ) : searchResults ? (
            // Search results view
            <AnimatePresence>
                <motion.div layout className="grid grid-cols-2 gap-4 landscape:grid-cols-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {searchResults.map((app) => (
                    <AppCard 
                        key={app.name} 
                        app={app} 
                        localServerUrl={localServerUrl} 
                        isPinned={pinnedApps.includes(app.name)} 
                        onPinToggle={togglePin}
                        index={0}
                    />
                    ))}
                </motion.div>
                {searchResults.length === 0 && (
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center gap-4 py-16 text-center"
                    >
                        <Search className="h-16 w-16 text-muted-foreground/50" />
                        <h2 className="text-xl font-semibold">No Applications Found</h2>
                        <p className="text-muted-foreground">
                           Your search for "{searchQuery}" did not match any applications.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        ) : Object.keys(displayedGroups).length > 0 ? (
            // Grouped view
            <DragDropContext onDragEnd={onDragEnd}>
              <Accordion type="multiple" value={openGroups} onValueChange={setOpenGroups} className="w-full space-y-4">
                {Object.entries(displayedGroups).map(([groupName, appsInGroup]) => (
                   <AccordionItem value={groupName} key={groupName} className="border-none">
                     <AccordionTrigger className="rounded-lg bg-muted/50 px-4 py-2 text-base font-semibold hover:no-underline">
                        {groupName}
                     </AccordionTrigger>
                     <AccordionContent className="pt-4">
                       <Droppable droppableId={groupName} isDropDisabled={groupName !== 'Pinned'}>
                        {(provided) => (
                            <motion.div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            layout
                            className="grid grid-cols-2 gap-4 landscape:grid-cols-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                            >
                            {appsInGroup.map((app, index) => (
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
                     </AccordionContent>
                   </AccordionItem>
                ))}
              </Accordion>
            </DragDropContext>
        ) : (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center gap-4 py-16 text-center"
            >
                <Search className="h-16 w-16 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold">No Applications Found</h2>
                <div className="text-muted-foreground max-w-md">
                    {isConnected ? (
                        <>
                        <p>No applications seem to be configured on your PC.</p>
                        <Alert className="mt-4 text-left">
                            <Info className="h-4 w-4" />
                            <AlertTitle>How to Add Apps</AlertTitle>
                            <AlertDescription>
                                <ol className="list-decimal list-inside space-y-1 mt-2">
                                    <li>Open the `local_server.py` file on your computer.</li>
                                    <li>Find the `APPS =` section.</li>
                                    <li>Uncomment or add the apps you want to use.</li>
                                    <li>Save the file and restart the server.</li>
                                </ol>
                            </AlertDescription>
                        </Alert>
                        </>
                    ) : (
                        <p>Connect to your PC to see your applications.</p>
                    )}
                </div>
            </motion.div>
        )}
      </main>
    </div>
  );
}
