// WINDSURF DIEGO: 
// Módulo de gestión de permisos para Open WebUI
// Implementa un sistema de control de acceso basado en roles y permisos granulares

import { derived } from 'svelte/store';
import { user } from './index';

// Definición de interfaces para estructurar los permisos de workspace
export interface WorkspacePermissions {
  // Permisos específicos para diferentes secciones del workspace
  models?: boolean;      // Permiso para acceder/gestionar modelos
  knowledge?: boolean;   // Permiso para acceder/gestionar base de conocimientos
  prompts?: boolean;     // Permiso para acceder/gestionar prompts
  tools?: boolean;       // Permiso para acceder/gestionar herramientas
}

// Interfaz que agrupa los permisos de usuario
export interface UserPermissions {
  workspace?: WorkspacePermissions;  // Permisos específicos del workspace
}

// Función auxiliar para verificar roles de usuario
// WINDSURF DIEGO: Implementación flexible de verificación de roles
export const hasRole = (userRole: string | undefined, requiredRole: string): boolean => {
  if (!userRole) return false;           // Sin rol, acceso denegado
  if (userRole === 'admin') return true;  // Administradores tienen acceso total
  return userRole === requiredRole;       // Comparación directa de roles
};

// Función para verificar permisos específicos de workspace
// WINDSURF DIEGO: Permite un control de acceso granular y configurable
export const hasWorkspacePermission = (
  userRole: string | undefined,
  userPermissions: UserPermissions | undefined,
  permission: keyof WorkspacePermissions
): boolean => {
  if (!userRole || !userPermissions) return false;  // Sin rol o permisos, acceso denegado
  if (userRole === 'admin') return true;            // Administradores tienen acceso total

  // Verifica el permiso específico para el workspace
  return !!userPermissions.workspace?.[permission];
};

// Store derivado para manejar permisos de manera reactiva
// WINDSURF DIEGO: Utiliza Svelte derived store para crear un sistema de permisos dinámico
export const permissions = derived(user, ($user) => ({
  // Verificación de roles
  isAdmin: hasRole($user?.role, 'admin'),        // ¿Es administrador?
  isUser: hasRole($user?.role, 'user'),          // ¿Es usuario estándar?
  isPending: hasRole($user?.role, 'pending'),    // ¿Está pendiente de activación?

  // Permisos específicos de workspace
  canAccessModels: hasWorkspacePermission($user?.role, $user?.permissions, 'models'),
  canAccessKnowledge: hasWorkspacePermission($user?.role, $user?.permissions, 'knowledge'),
  canAccessPrompts: hasWorkspacePermission($user?.role, $user?.permissions, 'prompts'),
  canAccessTools: hasWorkspacePermission($user?.role, $user?.permissions, 'tools'),

  // Verificación general de acceso al workspace
  // Si es admin o tiene al menos un permiso de workspace, se permite el acceso
  canAccessWorkspace: $user?.role === 'admin' || 
    Object.values($user?.permissions?.workspace || {}).some(Boolean)
}));
