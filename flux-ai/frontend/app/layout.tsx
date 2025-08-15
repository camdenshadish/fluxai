import './globals.css';
const React = {} as any;

export const metadata = {
  title: 'Flux AI',
  description: 'AI agent creation platform'
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="p-3 flex items-center justify-between border-b">
          <div className="font-semibold">Flux AI</div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/dashboard" className="underline">Dashboard</a>
            <a href="/create" className="underline">Create</a>
            <a href="/marketplace" className="underline">Marketplace</a>
            <ThemeToggle />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}

function ThemeToggle() {
  function toggle() {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark');
  }
  return <button onClick={toggle} className="text-sm underline">Toggle theme</button>;
}


