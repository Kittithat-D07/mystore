import Navbar from "../../components/Navbar";
import FloatingChat from "../../components/FloatingChat";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <FloatingChat />
    </>
  );
}
