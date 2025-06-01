import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  MapPin, 
  Wrench, 
  Snowflake, 
  Thermometer, 
  ClipboardList,
  AlertTriangle,
  Play,
  CheckCircle
} from "lucide-react";

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

interface JobCardProps {
  job: Job;
  onStatusUpdate?: (jobId: number, status: string) => void;
}

export function JobCard({ job, onStatusUpdate }: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': 
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress': 
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'scheduled': 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'cancelled': 
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': 
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': 
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': 
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'repair':
        if (job.title.toLowerCase().includes('ac') || job.title.toLowerCase().includes('cooling')) {
          return <Snowflake className="h-5 w-5 text-blue-600" />;
        }
        if (job.title.toLowerCase().includes('heat') || job.title.toLowerCase().includes('furnace')) {
          return <Thermometer className="h-5 w-5 text-orange-600" />;
        }
        return <Wrench className="h-5 w-5 text-gray-600" />;
      case 'install':
      case 'installation':
        return <Thermometer className="h-5 w-5 text-orange-600" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5 text-green-600" />;
      case 'quote':
        return <ClipboardList className="h-5 w-5 text-blue-600" />;
      default:
        return <Wrench className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(job.id, newStatus);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${
      job.priority === 'urgent' ? 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950' : 
      job.status === 'in_progress' ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              job.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900' :
              job.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900' :
              job.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
              'bg-gray-100 dark:bg-gray-800'
            }`}>
              {getTypeIcon(job.type)}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground truncate">
                {job.title}
              </h3>
              <div className="flex items-center gap-2">
                {job.priority === 'urgent' && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                {getStatusIcon(job.status)}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(job.status)}>
                {job.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getPriorityColor(job.priority)}>
                {job.priority.toUpperCase()}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {job.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{job.scheduledTime}</span>
              </div>
              {job.estimatedDuration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(job.estimatedDuration)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>15 min drive</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {job.status === 'scheduled' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange('in_progress')}
                >
                  Start Job
                </Button>
              )}
              {job.status === 'in_progress' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange('completed')}
                >
                  Complete
                </Button>
              )}
              <Button variant="ghost" size="sm">
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
