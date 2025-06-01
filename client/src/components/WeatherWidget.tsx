import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, CloudSnow, Wind } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
}

export function WeatherWidget() {
  // Note: In a real implementation, you would fetch from a weather API
  // For now, we'll use a mock weather service or return default data
  const { data: weather, isLoading } = useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    retry: false,
    // Provide fallback data when API is not available
    queryFn: async () => {
      // This would normally call a weather API
      // For demo purposes, return mock data
      throw new Error("Weather API not implemented");
    },
  });

  // Default weather data when API is not available
  const defaultWeather: WeatherData = {
    temperature: 72,
    condition: "Sunny",
    location: "Chicago, IL",
    humidity: 45,
    windSpeed: 8,
  };

  const weatherData = weather || defaultWeather;

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes("sunny") || lowerCondition.includes("clear")) {
      return <Sun className="h-5 w-5 text-yellow-500" />;
    }
    if (lowerCondition.includes("cloud")) {
      return <Cloud className="h-5 w-5 text-gray-500" />;
    }
    if (lowerCondition.includes("rain")) {
      return <CloudRain className="h-5 w-5 text-blue-500" />;
    }
    if (lowerCondition.includes("snow")) {
      return <CloudSnow className="h-5 w-5 text-blue-300" />;
    }
    return <Sun className="h-5 w-5 text-yellow-500" />;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 80) return "text-red-600";
    if (temp >= 70) return "text-orange-600";
    if (temp >= 60) return "text-green-600";
    if (temp >= 40) return "text-blue-600";
    return "text-blue-800";
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            {getWeatherIcon(weatherData.condition)}
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-semibold ${getTemperatureColor(weatherData.temperature)}`}>
                  {weatherData.temperature}°F
                </span>
                <span className="text-sm text-muted-foreground">
                  {weatherData.condition}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {weatherData.location}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
