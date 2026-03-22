export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      // ใส่สีพื้นหลังเทาอ่อนตาม UI ที่เราออกแบบไว้
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        {children} 
        {/* ✅ ไม่มี Navbar และ Footer แล้ว! */}
      </div>
    );
  }