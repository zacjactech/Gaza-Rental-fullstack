'use client';

// This file is now a forwarding module to the correct toast implementation
// Original duplicate implementation has been removed to prevent conflicts

import { toast, useToast } from '@/components/ui/use-toast';

// Log a warning when this module is imported
console.warn(
  'Warning: You are importing from @/hooks/use-toast, which is deprecated.\n' +
  'Please update your imports to use @/components/ui/use-toast instead.'
);

// Re-export the correct implementations
export { toast, useToast };
export default useToast; 