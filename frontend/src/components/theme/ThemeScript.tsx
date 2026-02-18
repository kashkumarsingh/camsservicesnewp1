/**
 * Blocking script: runs before first paint so the correct theme class is on <html> and avoids flash.
 * Must stay in sync with ThemeContext (STORAGE_KEY and logic).
 */
const themeScript = `
(function() {
  var key = 'cams-theme';
  var stored = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  var dark = false;
  if (theme === 'dark') dark = true;
  else if (theme === 'light') dark = false;
  else dark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (theme === 'light') root.classList.add('light');
  else if (dark) root.classList.add('dark');
  root.style.colorScheme = dark ? 'dark' : 'light';
})();
`;

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
