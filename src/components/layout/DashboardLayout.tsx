import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Users,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronLeft,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface DashboardLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/students', label: 'Students', icon: Users },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
];

const studentNavItems = [
  { href: '/dashboard', label: 'My Profile', icon: User },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, signOut, isAdmin, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userInitial = user?.email?.[0].toUpperCase() || 'U';
  const userName = user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 lg:hidden flex items-center justify-between h-16 px-4 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">EduManager</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar gradient-sidebar transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            sidebarCollapsed ? 'w-[72px]' : 'w-72'
          )}
        >
          {/* Sidebar Header */}
          <div className={cn(
            'flex items-center h-16 px-4 border-b border-sidebar-border',
            sidebarCollapsed ? 'justify-center' : 'justify-between'
          )}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-sidebar-foreground">EduManager</h1>
                  <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Management System</p>
                </div>
              </div>
            )}
            
            {sidebarCollapsed && (
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
            )}

            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Collapse button for desktop */}
            {!sidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setSidebarCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Expand button when collapsed */}
          {sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex mx-auto mt-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setSidebarCollapsed(false)}
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          )}

          {/* Role Badge */}
          {!sidebarCollapsed && (
            <div className="px-4 pt-5 pb-2">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isAdmin ? 'bg-primary animate-pulse-subtle' : 'bg-accent'
                )} />
                <Shield className="h-3.5 w-3.5 text-sidebar-foreground/70" />
                <span className="text-xs font-medium text-sidebar-foreground/90 uppercase tracking-wide">
                  {role || 'Loading...'}
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className={cn('flex-1 py-4', sidebarCollapsed ? 'px-2' : 'px-3')}>
            <div className="space-y-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'nav-item group',
                      isActive && 'active',
                      sidebarCollapsed && 'justify-center px-0'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? '' : 'text-sidebar-foreground/70')} />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {isActive && !sidebarCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className={cn(
            'border-t border-sidebar-border',
            sidebarCollapsed ? 'p-2' : 'p-4'
          )}>
            {sidebarCollapsed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-full h-12 text-sidebar-foreground hover:bg-sidebar-accent">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm font-medium">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground font-medium">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2.5" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          'flex-1 min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
        )}>
          {/* Desktop Header */}
          <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Dashboard</span>
                {location.pathname !== '/dashboard' && (
                  <>
                    <span>/</span>
                    <span className="capitalize">
                      {location.pathname.split('/').pop()}
                    </span>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className={cn(
                'capitalize font-medium',
                isAdmin ? 'border-primary/30 text-primary bg-primary/5' : 'border-accent/30 text-accent bg-accent/5'
              )}>
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full mr-2',
                  isAdmin ? 'bg-primary' : 'bg-accent'
                )} />
                {role}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 gap-2 pl-2 pr-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden xl:inline-block">{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 md:p-6 lg:p-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}