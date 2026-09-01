import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const { session, isAdmin, loading, signOut, user } = useAdminAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const link = ({ isActive }: { isActive: boolean }) =>
    cn(
      "block px-3 py-2 rounded-md text-sm",
      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
    );

  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr] bg-background">
      <aside className="border-r p-4 flex flex-col gap-1">
        <div className="text-xs uppercase text-muted-foreground mb-3 px-3">Gallery Admin</div>
        <NavLink to="/admin/upload" className={link}>Upload</NavLink>
        <NavLink to="/admin/gallery" end className={link}>Gallery</NavLink>
        <NavLink to="/admin/homepage" className={link}>Homepage</NavLink>
        <NavLink to="/admin/experience" className={link}>Experience Page</NavLink>
        <NavLink to="/admin/services" className={link}>Services Page</NavLink>
        <NavLink to="/admin/previews" className={link}>Same Day Previews</NavLink>
        <NavLink to="/admin/stories" className={link}>Stories</NavLink>
        <NavLink to="/admin/categories" className={link}>Categories</NavLink>
        <NavLink to="/admin/alt-templates" className={link}>Alt templates</NavLink>
        <NavLink to="/admin/import" className={link}>Import</NavLink>
        <div className="mt-auto pt-4 border-t text-xs text-muted-foreground">
          <div className="px-3 mb-2 break-all">{user?.email}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>Sign out</Button>
        </div>
      </aside>
      <main className="p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}