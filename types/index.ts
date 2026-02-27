export interface DocuForgeProject {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  pages: Page[];
  metadata: ProjectMetadata;
}

export interface ProjectMetadata {
  pageSize: PageSize;
  orientation: PageOrientation;
  author?: string;
  description?: string;
  tags: string[];
}

export type PageSize = 'A4' | 'LETTER' | 'LEGAL' | 'A3' | 'CUSTOM';
export type PageOrientation = 'PORTRAIT' | 'LANDSCAPE';

export interface Page {
  id: string;
  number: number;
  elements: PageElement[];
  background?: string;
  margins: PageMargins;
}

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type PageElement = TextElement | ImageElement | IconElement;

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
}

export type ElementType = 'TEXT' | 'IMAGE' | 'ICON';

export interface TextElement extends BaseElement {
  type: 'TEXT';
  content: string;
  style: TextStyle;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  color: string;
  backgroundColor?: string;
  textAlign: TextAlign;
  lineHeight: number;
  letterSpacing: number;
  italic: boolean;
  underline: boolean;
}

export type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface ImageElement extends BaseElement {
  type: 'IMAGE';
  src: string;
  alt?: string;
  originalWidth: number;
  originalHeight: number;
  aspectRatioLocked: boolean;
}

export interface IconElement extends BaseElement {
  type: 'ICON';
  iconName: string;
  iconLibrary: IconLibrary;
  color: string;
}

export type IconLibrary = 'lucide' | 'heroicons';

// Font and icon library types
export interface FontFamily {
  id: string;
  name: string;
  family: string;
  category: FontCategory;
  webSafe: boolean;
}

export type FontCategory = 'SERIF' | 'SANS_SERIF' | 'MONOSPACE' | 'DISPLAY' | 'HANDWRITING';

export interface IconSet {
  id: string;
  name: string;
  library: IconLibrary;
  category: IconCategory;
  icons: IconDefinition[];
}

export type IconCategory = 'BUSINESS' | 'TECHNOLOGY' | 'SYMBOLS' | 'ARROWS' | 'COMMUNICATION';

export interface IconDefinition {
  name: string;
  svgPath: string;
  keywords: string[];
}

// Export and file types
export type ExportFormat = 'TXT' | 'PDF' | 'HTML' | 'DOCX';
export type ProjectFileFormat = '.dfp';

export interface ExportOptions {
  format: ExportFormat;
  quality?: number;
  includeMetadata?: boolean;
  pages?: number[];
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileSystemItemType;
  path: string[];
  createdAt: Date;
  updatedAt: Date;
  size?: number;
}

export type FileSystemItemType = 'FILE' | 'FOLDER';

// Application state types
export interface AppState {
  currentProjectId?: string;
  currentPageId?: string;
  selectedElementIds: string[];
  viewMode: ViewMode;
  toolMode: ToolMode;
}

export type ViewMode = 'EDIT' | 'PREVIEW';
export type ToolMode = 'SELECT' | 'TEXT' | 'IMAGE' | 'ICON';

// UI state types
export interface UIState {
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  activeToolbarTab?: ToolbarTab;
  zoomLevel: number;
}

export type ToolbarTab = 'FORMAT' | 'INSERT' | 'PAGES' | 'EXPORT';

// Event types
export interface CanvasEvent {
  type: CanvasEventType;
  pageId?: string;
  elementId?: string;
}

export type CanvasEventType = 
  | 'ELEMENT_SELECTED'
  | 'ELEMENT_MOVED'
  | 'ELEMENT_RESIZED'
  | 'ELEMENT_ROTATED'
  | 'ELEMENT_DELETED'
  | 'PAGE_CHANGED';

// Settings and preferences
export interface UserPreferences {
  themeMode: ThemeMode;
  autoSaveInterval: number; // in minutes
  defaultPageSize: PageSize;
  defaultFontFamily: string;
  keyboardShortcutsEnabled: boolean;
}

export type ThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM';

// API and storage types
export interface StorageProvider {
  saveProject(project: DocuForgeProject): Promise<void>;
  loadProject(id: string): Promise<DocuForgeProject>;
  listProjects(): Promise<FileSystemItem[]>;
}

// Validation schemas (for use with zod)
import { z } from 'zod';

export const textStyleSchema = z.object({
  fontFamily: z.string(),
  fontSize: z.number().min(8).max(144),
  fontWeight: z.enum(['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']),
  lineHeight: z.number().min(0.5).max(3),
  letterSpacing: z.number().min(-2).max(10),
  italic: z.boolean(),
  underline: z.boolean(),
});

// Utility types
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

// Component props types
export interface WithClassName {
    className?: string;
}

// Event handler types
export type MouseEventHandler<T = HTMLElement> = React.MouseEventHandler<T>;
export type KeyboardEventHandler<T = HTMLElement> = React.KeyboardEventHandler<T>;
export type ChangeEventHandler<T = HTMLElement> = React.ChangeEventHandler<T>;

// Responsive breakpoints
export const Breakpoints = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
} as const;

export type Breakpoint = keyof typeof Breakpoints;

// Color palette
export const Colors = {
    primaryGradientFrom: '#e94584',
    primaryGradientTo: '#00b4d8',
    backgroundFrom: '#1a1a2e',
    backgroundTo: '#16213e',
    panelBackground: '#0f3460',
    textPrimary: '#ffffff',
    textSecondary: '#a0aec0',
    borderSubtle: '#2d3748',
    success: '#48bb78',
    warning: '#ed8936',
    error: '#f56565',
} as const;

// Animation durations
export const AnimationDurations = {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
} as const;

// Keyboard shortcuts
export const KeyboardShortcuts = {
    SAVE_PROJECT: ['Control', 's'],
    BOLD_TEXT: ['Control', 'b'],
    ITALIC_TEXT: ['Control', 'i'],
    UNDERLINE_TEXT: ['Control', 'u'],
    UNDO_ACTION: ['Control', 'z'],
    REDO_ACTION: ['Control', 'Shift', 'z'],
    DELETE_SELECTION: ['Delete'],
} as const;

// File constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];