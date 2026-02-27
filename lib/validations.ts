import { z } from 'zod';

// Document validation schemas
export const documentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int().positive(),
  authorId: z.string().uuid(),
});

export const pageSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string().uuid(),
  pageNumber: z.number().int().positive(),
  content: z.string(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
  width: z.number().positive().default(794), // A4 width in pixels at 96 DPI
  height: z.number().positive().default(1123), // A4 height in pixels at 96 DPI
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  elements: z.array(z.any()).default([]),
});

export const textElementSchema = z.object({
  type: z.literal('text'),
  id: z.string().uuid(),
  content: z.string(),
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().positive(),
  height: z.number().positive(),
  fontSize: z.number().positive().min(8).max(144),
  fontFamily: z.string(),
  fontWeight: z.enum(['normal', 'bold', 'lighter', 'bolder', '100', '200', '300', '400', '500', '600', '700', '800', '900']),
  fontStyle: z.enum(['normal', 'italic', 'oblique']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']),
  lineHeight: z.number().positive().min(0.5).max(3),
  letterSpacing: z.number().min(-5).max(20),
  rotation: z.number().min(-180).max(180).default(0),
  opacity: z.number().min(0).max(1).default(1),
});

export const imageElementSchema = z.object({
  type: z.literal('image'),
  id: z.string().uuid(),
  src: z.string().url('Invalid image URL'),
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().positive(),
  height: z.number().positive(),
  originalWidth: z.number().positive(),
  originalHeight: z.number().positive(),
  aspectRatioLocked: z.boolean().default(true),
  rotation: z.number().min(-180).max(180).default(0),
  opacity: z.number().min(0).max(1).default(1),
  altText: z.string().max(500, 'Alt text must be 500 characters or less').optional(),
});

export const iconElementSchema = z.object({
  type: z.literal('icon'),
  id: z.string().uuid(),
  iconName: z.string(),
  iconLibrary: z.enum(['lucide', 'heroicons']),
  x: z.number().min(0),
  y: z.number().min(0),
  size: z.number().positive().min(8).max(512),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  rotation: z.number().min(-180).max(180).default(0),
  opacity: z.number().min(0).max(1).default(1),
});

export const elementSchema = z.discriminatedUnion('type', [
  textElementSchema,
  imageElementSchema,
  iconElementSchema,
]);

export const exportSettingsSchema = z.object({
  format: z.enum(['pdf', 'txt', 'html', 'dfp']),
  quality: z.enum(['low', 'medium', 'high']).default('medium'),
  includeMetadata: z.boolean().default(true),
  compressionLevel: z.number().min(0).max(9).default(6),
});

export const userSettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'auto']).default('dark'),
  autoSave: z.boolean().default(true),
  autoSaveInterval: z.number().min(30).max(300).default(60),
  defaultFontSize: z.number().positive().default(16),
  defaultFontFamily: z.string().default('Inter'),
  defaultPageSize: z.enum(['A4', 'LETTER', 'LEGAL', 'A3']).default('A4'),
  defaultOrientation: z.enum(['portrait', 'landscape']).default('portrait'),
});

export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine((file) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      return allowedTypes.includes(file.type);
    }, 'File type must be JPEG, PNG, GIF, WebP, or SVG'),
});

export const projectSchema = documentSchema.extend({
  pages: z.array(pageSchema).min(1, 'Document must have at least one page'),
  settings: userSettingsSchema,
});

// Validation functions
export const validateDocument = (data: unknown) => {
  return documentSchema.safeParse(data);
};

export const validatePage = (data: unknown) => {
  return pageSchema.safeParse(data);
};

export const validateElement = (data: unknown) => {
  return elementSchema.safeParse(data);
};

export const validateExportSettings = (data: unknown) => {
  return exportSettingsSchema.safeParse(data);
};

export const validateUserSettings = (data: unknown) => {
  return userSettingsSchema.safeParse(data);
};

export const validateFileUpload = (data: unknown) => {
  return fileUploadSchema.safeParse(data);
};

export const validateProject = (data: unknown) => {
  return projectSchema.safeParse(data);
};

// Sanitization functions
export const sanitizeHtml = (html: string): string => {
  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  
  const doc = new DOMParser().parseFromString(html, 'text/html');
  
  doc.body.querySelectorAll('*').forEach((element) => {
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      element.remove();
    }
    
    // Remove all attributes except class and style
    Array.from(element.attributes).forEach((attr) => {
      if (!['class', 'style'].includes(attr.name)) {
        element.removeAttribute(attr.name);
      }
    });
    
    // Sanitize style attribute
    if (element.hasAttribute('style')) {
      const style = element.getAttribute('style') || '';
      const allowedStyles = [
        'color',
        'background-color',
        'font-size',
        'font-family',
        'font-weight',
        'font-style',
        'text-align',
        'line-height',
        'letter-spacing',
        'text-decoration'
      ];
      
      const sanitizedStyles = style.split(';')
        .map((rule) => rule.trim())
        .filter((rule) => {
          const [property] = rule.split(':');
          return allowedStyles.includes(property.trim());
        })
        .join('; ');
      
      element.setAttribute('style', sanitizedStyles);
    }
    
    // Sanitize class attribute
    if (element.hasAttribute('class')) {
      const classes = element.getAttribute('class')?.split(' ') || [];
      const allowedClasses = classes.filter((cls) => 
        cls.startsWith('text-') || 
        cls.startsWith('bg-') || 
        cls.startsWith('font-') ||
        cls === 'italic' ||
        cls === 'bold' ||
        cls === 'underline'
      );
      element.setAttribute('class', allowedClasses.join(' '));
    }
  });
  
  return doc.body.innerHTML;
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\.\./g, '_')
    .trim()
    .slice(0, 255);
};

export const sanitizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    
    // Allow only http/https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol');
    }
    
    // Sanitize URL components
    parsedUrl.hash = '';
    
    return parsedUrl.toString();
  } catch {
    return '';
  }
};

// Type exports
export type Document = z.infer<typeof documentSchema>;
export type Page = z.infer<typeof pageSchema>;
export type TextElement = z.infer<typeof textElementSchema>;
export type ImageElement = z.infer<typeof imageElementSchema>;
export type IconElement = z.infer<typeof iconElementSchema>;
export type Element = TextElement | ImageElement | IconElement;
export type ExportSettings = z.infer<typeof exportSettingsSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type Project = Document & {
  pages: Page[];
  settings: UserSettings;
};

// Utility validation functions
export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

export const isValidFontSize = (size: number): boolean => {
  return size >= 8 && size <= 144;
};

export const isValidPageSize = (size: string): boolean => {
  return ['A4', 'LETTER', 'LEGAL', 'A3'].includes(size);
};

export const isValidOrientation = (orientation: string): boolean => {
  return ['portrait', 'landscape'].includes(orientation);
};

// File validation helpers
export const validateImageDimensions = (
  file: File,
  maxWidth?: number,
  maxHeight?: number
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (maxWidth && img.width > maxWidth) {
        resolve(false);
      } else if (maxHeight && img.height > maxHeight) {
        resolve(false);
      } else {
        resolve(true);
      }
    };
    img.onerror = () => resolve(false);
    img.src = URL.createObjectURL(file);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(img.src), 1000);
  });
};

export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (
  file: File,
  maxSizeInMB: number
): boolean => {
  return file.size <= maxSizeInMB * 1024 * 1024;
};

// Export format validation
export const getSupportedExportFormats = (): string[] => {
  return ['pdf', 'txt', 'html', 'dfp'];
};

export const isValidExportFormat = (format: string): boolean => {
  return getSupportedExportFormats().includes(format.toLowerCase());
};

// Page number validation
export const validatePageNumber = (
  pageNumber: number,
  totalPages?: number
): boolean => {
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return false;
  }
  
  if (totalPages !== undefined && pageNumber > totalPages) {
    return false;
  }
  
  return true;
};