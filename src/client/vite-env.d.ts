/// <reference types="vite/client" />

/**
 * Declare module for Vue files.
 * 
 * This module declaration allows TypeScript to recognize Vue files as modules.
 * 
 * @module '*.vue'
*/
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
