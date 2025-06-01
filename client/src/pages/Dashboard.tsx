import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { WeatherWidget } from "@/components/WeatherWidget";
import { JobCard } from "@/components/JobCard";
import { CreateJobModal } from "@/components/CreateJobModal";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Plus,
  Bell,
  User,
  ClipboardList,
  File
} from "lucide-react";
import { useState } from "react";

interface DashboardStats {
  todaysJobs: number;
  completedJobs: number;
  revenue: number;
  overdueInvoices: number;
}

interface Job {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  customerId: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: todaysJobs, isLoading: jobsLoading, error: jobsError } = useQuery<Job[]>({
    queryKey: ["/api/dashboard/todays-jobs"],
    retry: false,
    enabled: isAuthenticated,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [statsError, toast]);

  useEffect(() => {
    if (jobsError && isUnauthorizedError(jobsError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [jobsError, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const urgentJobs = todaysJobs?.filter(job => job.priority === 'urgent') || [];
  const overdueCount = stats?.overdueInvoices || 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          <MobileNav />
          
          <div className="flex-1 p-4 lg:p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Good morning!</h1>
                <p className="text-lg text-muted-foreground">{currentDate}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <WeatherWidget />
                <Button 
                  onClick={() => setIsJobModalOpen(true)}
                  size="lg"
                  className="btn-hover shadow-lg bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Schedule Job
                </Button>
              </div>
            </div>

            {/* Priority Alerts */}
            {(urgentJobs.length > 0 || overdueCount > 0) && (
              <Card className="border-destructive bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Priority Alerts ({urgentJobs.length + overdueCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {urgentJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between bg-white rounded p-3">
                      <div>
                        <p className="font-medium text-destructive">Urgent Job - {job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.description}</p>
                      </div>
                      <Badge variant="destructive">URGENT</Badge>
                    </div>
                  ))}
                  
                  {overdueCount > 0 && (
                    <div className="flex items-center justify-between bg-white rounded p-3">
                      <div>
                        <p className="font-medium text-destructive">Overdue Invoices</p>
                        <p className="text-sm text-muted-foreground">{overdueCount} invoices need attention</p>
                      </div>
                      <Badge variant="destructive">OVERDUE</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-hover enhanced-shadow border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Today's Jobs</p>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        <p className="text-3xl font-bold text-blue-800 dark:text-blue-100">{stats?.todaysJobs || 0}</p>
                      )}
                    </div>
                    <div className="p-3 bg-blue-500 rounded-full">
                      <ClipboardList className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover enhanced-shadow border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Completed</p>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        <p className="text-3xl font-bold text-green-800 dark:text-green-100">{stats?.completedJobs || 0}</p>
                      )}
                    </div>
                    <div className="p-3 bg-green-500 rounded-full">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover enhanced-shadow border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Today's Revenue</p>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-100">
                          ${stats?.revenue?.toFixed(2) || '0.00'}
                        </p>
                      )}
                    </div>
                    <div className="p-3 bg-emerald-500 rounded-full">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover enhanced-shadow border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Overdue</p>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        <p className="text-3xl font-bold text-amber-800 dark:text-amber-100">{stats?.overdueInvoices || 0}</p>
                      )}
                    </div>
                    <div className="p-3 bg-amber-500 rounded-full">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <div className="lg:col-span-2">
                <Card className="enhanced-shadow border-0">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl font-semibold">Today's Schedule</CardTitle>
                        <p className="text-sm text-muted-foreground">Manage your appointments and service calls</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-primary font-medium">
                          List View
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          Map View
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {jobsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-start space-x-4 p-4 border rounded-xl bg-muted/30">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <Skeleton className="h-3 w-1/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : todaysJobs && todaysJobs.length > 0 ? (
                      <div className="space-y-4">
                        {todaysJobs.map(job => (
                          <JobCard key={job.id} job={job} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-blue-50 dark:bg-blue-950 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                          <ClipboardList className="h-10 w-10 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No jobs scheduled for today</h3>
                        <p className="text-muted-foreground mb-6">Start by scheduling your first service appointment</p>
                        <Button 
                          onClick={() => setIsJobModalOpen(true)}
                          className="btn-hover"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Schedule First Job
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Tech Status */}
                <Card className="enhanced-shadow border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Tech Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="w-4 h-4 bg-green-500 rounded-full status-pulse"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-green-800 dark:text-green-200">You</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Available for service calls</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="enhanced-shadow border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 btn-hover border-blue-200 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:hover:bg-blue-950"
                      onClick={() => setIsJobModalOpen(true)}
                    >
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                        <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Create Job
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 btn-hover border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-800 dark:hover:bg-purple-950">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
                        <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      Add Customer
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 btn-hover border-orange-200 hover:bg-orange-50 hover:border-orange-300 dark:border-orange-800 dark:hover:bg-orange-950">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg mr-3">
                        <File className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      Generate Invoice
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="enhanced-shadow border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4 p-3 bg-muted/30 rounded-xl">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Job completed successfully</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-3 bg-muted/30 rounded-xl">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">New customer added</p>
                          <p className="text-xs text-muted-foreground">4 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CreateJobModal 
        open={isJobModalOpen} 
        onOpenChange={setIsJobModalOpen}
      />
    </SidebarProvider>
  );
}
