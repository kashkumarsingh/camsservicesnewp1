/**
 * Module declaration for lucide-react when tsc cannot resolve its types (e.g. with moduleResolution: "bundler").
 * The package ships its own types; this fallback ensures npx tsc --noEmit passes.
 */
declare module 'lucide-react';
