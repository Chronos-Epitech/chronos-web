export function HeaderTitle({ className, title }: { className?: string; title: string }) {
  return (
    <header className={`p-4 ${className}`}>
      <h1 className="text-xl font-semibold">{title}</h1>
    </header>
  );
}