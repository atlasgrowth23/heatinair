import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import {
  Menu,
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Users,
  File,
  Bell,
  Wrench,
  LogOut
} from "lucide-react";

const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Schedule",
    url: "/schedule",
    icon: Calendar,
  },
  {
    title: "Jobs",
    url: "/jobs",
    icon: ClipboardList,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: File,
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center space-x-3 p-6 border-b">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-foreground">FieldPro</h1>
                      <p className="text-xs text-muted-foreground">HVAC Management</p>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 px-4 py-6">
                    <div className="space-y-2">
                      {navigation.map((item) => {
                        const isActive = location === item.url;
                        return (
                          <Link key={item.title} href={item.url}>
                            <Button
                              variant={isActive ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => setOpen(false)}
                            >
                              <item.icon className="h-4 w-4 mr-3" />
                              {item.title}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  </nav>

                  {/* Footer */}
                  <div className="p-4 border-t">
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg mb-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-foreground">
                          {user?.firstName?.[0] || user?.email?.[0] || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user?.firstName && user?.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user?.email || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.role === "SoloOwner" ? "Owner" : user?.role || "User"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Wrench className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-foreground">FieldPro</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="grid grid-cols-5 gap-1">
          {navigation.map((item) => {
            const isActive = location === item.url;
            return (
              <Link key={item.title} href={item.url}>
                <Button
                  variant="ghost"
                  className={`h-16 flex flex-col gap-1 rounded-none ${
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
