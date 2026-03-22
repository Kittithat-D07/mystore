import { auth } from "../../auth";
import { redirect } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg)" }}>
      <AdminSidebar />
      <main style={{ flex:1, minWidth:0, overflowY:"auto" }}>
        {children}
      </main>
    </div>
  );
}
