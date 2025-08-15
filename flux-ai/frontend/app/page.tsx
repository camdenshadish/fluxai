"use client";
// Ensure React identifier is in scope for classic JSX runtimes in some tooling
const React = {} as any;

export default function Home() {
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Flux AI</h1>
        <nav className="space-x-4">
          <a href="/login" className="text-sm underline">Login</a>
          <a href="/signup" className="text-sm underline">Sign Up</a>
        </nav>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <a href="/editor" className="p-4 rounded border hover:bg-gray-50 dark:hover:bg-gray-900">
          <div className="font-medium">Open Editor</div>
          <div className="text-sm text-gray-500">Design your agent workflows visually</div>
        </a>
        <a href="/dashboard" className="p-4 rounded border hover:bg-gray-50 dark:hover:bg-gray-900">
          <div className="font-medium">Dashboard</div>
          <div className="text-sm text-gray-500">Manage agents, executions, and analytics</div>
        </a>
        <a href="/marketplace" className="p-4 rounded border hover:bg-gray-50 dark:hover:bg-gray-900">
          <div className="font-medium">Marketplace</div>
          <div className="text-sm text-gray-500">Discover and share nodes and workflows</div>
        </a>
      </section>
    </main>
  );
}


