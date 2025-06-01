import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CreateJobModal } from "@/components/CreateJobModal";
import { Plus, Calendar as CalendarIcon, List } from "lucide-react";

interface Job {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  customerId: number;
}

export default function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    retry: false,
  });

  const selectedDateJobs = jobs?.filter(job => {
    if (!date) return false;
    const jobDate = new Date(job.scheduledDate);
    return jobDate.toDateString() === date.toDateString();
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                <h1 className="text-2xl font-bold text-foreground">Schedule & Dispatch</h1>
                <p className="text-muted-foreground">Manage your daily operations and job assignments</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </Button>
                </div>
                <Button onClick={() => setIsJobModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Job
                </Button>
              </div>
            </div>

            {viewMode === 'calendar' ? (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>

                {/* Selected Date Jobs */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>
                      Jobs for {date?.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">Loading jobs...</p>
                      </div>
                    ) : selectedDateJobs.length > 0 ? (
                      <div className="space-y-4">
                        {selectedDateJobs.map(job => (
                          <div key={job.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{job.title}</h3>
                                <Badge className={getStatusColor(job.status)}>
                                  {job.status.replace('_', ' ')}
                                </Badge>
                                <Badge className={getPriorityColor(job.priority)}>
                                  {job.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{job.scheduledTime}</span>
                                <span>{job.type}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No jobs scheduled for this date</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setIsJobModalOpen(true)}
                        >
                          Schedule Job
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* List View */
              <Card>
                <CardHeader>
                  <CardTitle>All Scheduled Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Loading jobs...</p>
                    </div>
                  ) : jobs && jobs.length > 0 ? (
                    <div className="space-y-4">
                      {jobs.map(job => (
                        <div key={job.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{job.title}</h3>
                              <Badge className={getStatusColor(job.status)}>
                                {job.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={getPriorityColor(job.priority)}>
                                {job.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{new Date(job.scheduledDate).toLocaleDateString()}</span>
                              <span>{job.scheduledTime}</span>
                              <span>{job.type}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No jobs found</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setIsJobModalOpen(true)}
                      >
                        Create First Job
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
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
