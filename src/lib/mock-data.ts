import type { LucideIcon } from 'lucide-react';
import { Code, Terminal, Chrome, Figma, Bot, FileText, GitBranch, Mic, Music, Camera, Pin, PinOff, GripVertical, Calculator, Gamepad2, Folder, Image, Mail } from 'lucide-react';

export interface App {
  name: string;
  icon: keyof typeof ICONS;
  command?: string; // command is optional on the client
}

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
    pin: Pin,
    pinoff: PinOff,
    gripvertical: GripVertical,
    calculator: Calculator,
    gamepad2: Gamepad2,
    folder: Folder,
    image: Image,
    mail: Mail,
    // Add other relevant icons here
} as const;

export type IconName = keyof typeof ICONS;

export const getIcon = (name: IconName | undefined): LucideIcon => {
    if (name && ICONS[name]) {
        return ICONS[name];
    }
    return Code; // Default icon
};
