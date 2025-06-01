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
          
          <div className="flex-1 p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">{currentDate}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <WeatherWidget />
                <Button onClick={() => setIsJobModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Job
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Jobs</p>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        <p className="text-2xl font-bold">{stats?.todaysJobs || 0}</p>
                      )}
                    </div>
                    <ClipboardList className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        <p className="text-2xl font-bold text-green-600">{stats?.completedJobs || 0}</p>
                      )}
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Revenue</p>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold text-green-600">
                          ${stats?.revenue?.toFixed(2) || '0.00'}
                        </p>
                      )}
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Overdue</p>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        <p className="text-2xl font-bold text-orange-600">{stats?.overdueInvoices || 0}</p>
                      )}
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Today's Schedule</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-primary">
                          List View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Map View
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {jobsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                            <Skeleton className="w-12 h-12" />
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
                      <div className="text-center py-8">
                        <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No jobs scheduled for today</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setIsJobModalOpen(true)}
                        >
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
                <Card>
                  <CardHeader>
                    <CardTitle>Tech Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">You</p>
                        <p className="text-xs text-green-700 dark:text-green-300">Available</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setIsJobModalOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Job
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Add Customer
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <File className="h-4 w-4 mr-2" />
                      Generate Invoice
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm">Job completed successfully</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm">New customer added</p>
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
