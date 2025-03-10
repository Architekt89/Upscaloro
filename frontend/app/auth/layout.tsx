export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-black overflow-hidden">
      {children}
    </div>
  );
} 