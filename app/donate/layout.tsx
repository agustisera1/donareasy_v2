export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b px-6 py-4">
        <span className="text-xl font-bold">Donareasy</span>
      </header>
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
