import type { LucideIcon } from 'lucide-react';
import { Code, Terminal, Chrome, Figma, Bot, FileText, GitBranch, Mic, Music, Camera } from 'lucide-react';

export interface App {
  name: string;
  icon: keyof typeof ICONS;
}

export const APPS: App[] = [
  { name: 'VS Code', icon: 'code' },
  { name: 'Terminal', icon: 'terminal' },
  { name: 'Google Chrome', icon: 'chrome' },
  { name: 'Figma', icon: 'figma' },
  { name: 'ChatGPT', icon: 'bot' },
  { name: 'Notion', icon: 'fileText' },
  { name: 'GitKraken', icon: 'gitBranch' },
  { name: 'Spotify', icon: 'music' },
  { name: 'Discord', icon: 'mic' },
  { name: 'OBS Studio', icon: 'camera' },
];

export const ICONS = {
    code: Code,
    terminal: Terminal,
    chrome: Chrome,
    figma: Figma,
    bot: Bot,
    fileText: FileText,
    gitBranch: GitBranch,
    mic: Mic,
    music: Music,
    camera: Camera,
} as const;

export type IconName = keyof typeof ICONS;

export const getIcon = (name: IconName): LucideIcon => {
    return ICONS[name] || Code;
};
