import { useState } from "react";
import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

export default function AdminLayout() {
  const { session, isAdmin, loading, signOut, user } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

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

  const nav = (
    <>
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
    </>
  );

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[220px_1fr]">
      {/* Mobile header */}
      <header className="md:hidden border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Gallery Admin</span>
          <Button
            variant="outline"
            size="sm"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Menu size={16} className="mr-1.5" /> Menu
          </Button>
        </div>
        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t px-3 py-3" onClick={() => setMenuOpen(false)} key={location.pathname}>
            {nav}
            <div className="mt-2 border-t pt-3 text-xs text-muted-foreground">
              <div className="px-3 mb-2 break-all">{user?.email}</div>
              <Button variant="outline" size="sm" className="w-full" onClick={signOut}>Sign out</Button>
            </div>
          </nav>
        )}
      </header>

      <aside className="hidden md:flex border-r p-4 flex-col gap-1">
        <div className="text-xs uppercase text-muted-foreground mb-3 px-3">Gallery Admin</div>
        {nav}
        <div className="mt-auto pt-4 border-t text-xs text-muted-foreground">
          <div className="px-3 mb-2 break-all">{user?.email}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>Sign out</Button>
        </div>
      </aside>
      <main className="w-full min-w-0 overflow-x-hidden p-4 md:p-6 md:overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
