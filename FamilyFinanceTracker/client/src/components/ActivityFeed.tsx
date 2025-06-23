import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { History, Plus, Trophy, Target } from "lucide-react";

interface Activity {
  id: number;
  type: 'contribution' | 'achievement' | 'goal_created';
  message: string;
  amount?: string;
  timestamp: Date;
  icon: 'plus' | 'trophy' | 'target';
  color: 'success' | 'achievement' | 'secondary';
}

export function ActivityFeed() {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'plus':
        return <Plus className="w-4 h-4 text-white" />;
      case 'trophy':
        return <Trophy className="w-4 h-4 text-white" />;
      case 'target':
        return <Target className="w-4 h-4 text-white" />;
      default:
        return <Plus className="w-4 h-4 text-white" />;
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'success':
        return 'bg-success';
      case 'achievement':
        return 'bg-achievement';
      case 'secondary':
        return 'bg-secondary';
      default:
        return 'bg-success';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const dateObj = new Date(date);
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Less than an hour ago";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  // Mock data for demonstration - in real app this would come from API
  const mockActivities: Activity[] = [
    {
      id: 1,
      type: 'contribution',
      message: 'Ahmed contributed 0.5 ETH to the "New Family Car" goal',
      amount: '+0.5 ETH',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: 'plus',
      color: 'success'
    },
    {
      id: 2,
      type: 'achievement',
      message: 'The "Family Summer Vacation" goal has been achieved and received an NFT reward!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      icon: 'trophy',
      color: 'achievement'
    },
    {
      id: 3,
      type: 'goal_created',
      message: 'A new goal "Home Renovation" has been created',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      icon: 'target',
      color: 'secondary'
    }
  ];

  const displayActivities: Activity[] = activities.length > 0 ? activities : mockActivities;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <History className="w-5 h-5 text-gray-400 ml-2" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 space-x-reverse p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity: Activity) => (
              <div key={activity.id} className="flex items-center space-x-4 space-x-reverse p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 ${getColorClass(activity.color)} rounded-full flex items-center justify-center`}>
                  {getIcon(activity.icon)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                </div>
                {activity.amount && (
                  <div className="text-left">
                    <p className="text-sm font-medium text-success">{activity.amount}</p>
                  </div>
                )}
                {activity.type === 'achievement' && (
                  <div className="text-left">
                    <Trophy className="w-5 h-5 text-achievement" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}