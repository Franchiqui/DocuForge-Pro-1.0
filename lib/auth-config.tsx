'use client';

import { type AuthStatusPaths } from '@/components/auth/auth-status';

/**
 * Rutas de autenticación utilizadas en toda la aplicación
 */
export const authPaths = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  profile: '/auth/profile',
  settings: '/auth/settings',
  logout: '/api/auth/logout',
} as const;

/**
 * Configuración de autenticación para la aplicación
 */
export interface AuthConfig {
  /** Rutas de autenticación */
  paths: typeof authPaths;
  /** Configuración de sesión */
  session: {
    /** Nombre de la cookie de sesión */
    cookieName: string;
    /** Tiempo de expiración de la sesión en segundos */
    maxAge: number;
    /** Si la sesión debe ser segura (HTTPS) */
    secure: boolean;
  };
  /** Proveedores de autenticación habilitados */
  providers: {
    /** Si el login con credenciales está habilitado */
    credentials: boolean;
    /** Proveedores OAuth habilitados */
    oauth: Array<'google' | 'github' | 'facebook'>;
  };
  /** Configuración de redirecciones */
  redirects: {
    /** Ruta a la que redirigir después de login exitoso */
    afterLogin: string;
    /** Ruta a la que redirigir después de logout */
    afterLogout: string;
    /** Ruta a la que redirigir si el usuario no está autenticado */
    unauthorized: string;
  };
}

/**
 * Configuración por defecto de autenticación
 */
export const defaultAuthConfig: AuthConfig = {
  paths: authPaths,
  session: {
    cookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'auth-session',
    maxAge: parseInt(process.env.NEXT_PUBLIC_AUTH_SESSION_MAX_AGE || '86400', 10), // 24 horas por defecto
    secure: process.env.NODE_ENV === 'production',
  },
  providers: {
    credentials: true,
    oauth: ['google', 'github'],
  },
  redirects: {
    afterLogin: authPaths.home,
    afterLogout: authPaths.home,
    unauthorized: authPaths.login,
  },
};

/**
 * Obtiene la configuración de autenticación
 * @returns Configuración de autenticación
 */
export function getAuthConfig(): AuthConfig {
  return defaultAuthConfig;
}

/**
 * Verifica si una ruta es una ruta de autenticación
 * @param path Ruta a verificar
 * @returns true si es una ruta de autenticación
 */
export function isAuthRoute(path: string): boolean {
  return path.startsWith('/auth') || path === authPaths.login || path === authPaths.register;
}

/**
 * Verifica si una ruta es una ruta protegida que requiere autenticación
 * @param path Ruta a verificar
 * @returns true si es una ruta protegida
 */
export function isProtectedRoute(path: string): boolean {
  const protectedRoutes = [
    authPaths.profile,
    authPaths.settings,
    '/dashboard',
    '/admin',
  ];
  
  return protectedRoutes.some(route => path.startsWith(route));
}

/**
 * Obtiene las rutas de autenticación para el componente AuthStatus
 * @returns Rutas de autenticación
 */
export function getAuthStatusPaths(): AuthStatusPaths {
  return {
    login: authPaths.login,
    register: authPaths.register,
    home: authPaths.home,
    profile: authPaths.profile,
    settings: authPaths.settings,
  };
}

/**
 * Tipo para las rutas de autenticación
 */
export type AuthPaths = typeof authPaths;

/**
 * Hook para obtener la configuración de autenticación
 * @returns Configuración de autenticación
 */
export function useAuthConfig() {
  return defaultAuthConfig;
}

/**
 * Hook para obtener las rutas de autenticación
 * @returns Rutas de autenticación
 */
export function useAuthPaths() {
  return authPaths;
}

export default defaultAuthConfig;
