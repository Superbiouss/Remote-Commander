"use client";

import { useState, useEffect, useTransition, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { APPS, getIcon, type App as AppType } from '@/lib/mock-data';
import { filterAppsAction, launchApp } from '@/app/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from './ui/button';

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

const AppCard = ({ app, onLaunch }: { app: AppType; onLaunch: (appName: string) => void }) => {
  const Icon = getIcon(app.icon);
  const [isLaunching, startLaunchTransition] = useTransition();

  const handleLaunch = () => {
    startLaunchTransition(() => {
      onLaunch(app.name);
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card
        className="h-full w-full overflow-hidden border-2 border-transparent transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary/20"
      >
        <Button
          variant="ghost"
          className="h-full w-full p-0"
          onClick={handleLaunch}
          disabled={isLaunching}
        >
          <CardContent className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
            {isLaunching ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
              <Icon className="h-10 w-10 text-primary" />
            )}
            <span className="text-center font-medium text-card-foreground">
              {app.name}
            </span>
          </CardContent>
        </Button>
      </Card>
    </motion.div>
  );
};


export default function AppLauncher() {
  const [apps, setApps] = useState<AppType[]>([]);
  const [filteredApps, setFilteredApps] = useState<AppType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltering, startFilteringTransition] = useTransition();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { toast } = useToast();

  const appNames = useMemo(() => apps.map(app => app.name), [apps]);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setApps(APPS);
      setFilteredApps(APPS);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleFilter = useCallback(async (query: string) => {
    startFilteringTransition(async () => {
      const filteredNames = await filterAppsAction(query, appNames);
      const newFilteredApps = apps.filter(app => filteredNames.includes(app.name));
      setFilteredApps(newFilteredApps);
    });
  }, [appNames, apps]);

  useEffect(() => {
    handleFilter(debouncedSearchQuery);
  }, [debouncedSearchQuery, handleFilter]);


  const handleLaunchApp = async (appName: string) => {
    const result = await launchApp(appName);
    toast({
      title: result.success ? 'Success' : 'Error',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
  };

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 4.5L7 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Remote Commander
            </h1>
        </div>
        <ThemeToggle />
      </header>

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
            {filteredApps.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              >
                {filteredApps.map((app) => (
                  <AppCard key={app.name} app={app} onLaunch={handleLaunchApp} />
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
                  Your search for "{searchQuery}" did not match any applications.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
