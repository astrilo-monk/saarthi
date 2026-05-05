import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, MessageCircle, Calendar, TrendingUp, AlertTriangle, Activity, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  emergencyAlerts: number;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    emergencyAlerts: 0
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Check if user has dev admin session
  const hasDevSession = () => {
    try {
      const session = localStorage.getItem('devAdminSession');
      if (session) {
        const parsed = JSON.parse(session);
        console.log('AdminPage - Dev session check:', parsed); // Debug log
        return parsed.isAdmin === true;
      }
      console.log('AdminPage - No dev session found'); // Debug log
      return false;
    } catch (error) {
      console.error('AdminPage - Error checking dev session:', error);
      return false;
    }
  };

  const handleLogout = () => {
    // Clear dev admin session
    localStorage.removeItem('devAdminSession');
    navigate('/');
  };

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = () => {
      setStats({
        totalUsers: 1247,
        activeUsers: 342,
        totalSessions: 856,
        emergencyAlerts: 12
      });
    };

    loadDashboardData();
  }, [selectedTimeRange]);

  // Mock data for charts
  const dailyActiveUsers = [
    { date: 'Mon', users: 45 },
    { date: 'Tue', users: 52 },
    { date: 'Wed', users: 48 },
    { date: 'Thu', users: 61 },
    { date: 'Fri', users: 55 },
    { date: 'Sat', users: 38 },
    { date: 'Sun', users: 42 }
  ];

  const topIssues = [
    { issue: 'Anxiety', count: 234, percentage: 35 },
    { issue: 'Stress', count: 189, percentage: 28 },
    { issue: 'Sleep Issues', count: 145, percentage: 22 },
    { issue: 'Depression', count: 98, percentage: 15 }
  ];

  const sessionTypes = [
    { name: 'AI Chat', value: 45, color: '#A7D1E8' },
    { name: 'Counselor Sessions', value: 30, color: '#2E4A62' },
    { name: 'Forum Posts', value: 15, color: '#E8A7A7' },
    { name: 'Resource Access', value: 10, color: '#B8E8A7' }
  ];

  const weeklyTrends = [
    { week: 'Week 1', chatSessions: 120, bookings: 45, forumPosts: 78 },
    { week: 'Week 2', chatSessions: 135, bookings: 52, forumPosts: 85 },
    { week: 'Week 3', chatSessions: 142, bookings: 48, forumPosts: 92 },
    { week: 'Week 4', chatSessions: 158, bookings: 61, forumPosts: 89 }
  ];

  const emergencyAlerts = [
    { id: 1, timestamp: '2024-01-15 14:30', type: 'Crisis Keywords', status: 'Resolved', severity: 'High' },
    { id: 2, timestamp: '2024-01-15 11:45', type: 'Repeated Help Requests', status: 'In Progress', severity: 'Medium' },
    { id: 3, timestamp: '2024-01-14 22:15', type: 'Crisis Keywords', status: 'Resolved', severity: 'High' },
    { id: 4, timestamp: '2024-01-14 16:20', type: 'Extended Session', status: 'Resolved', severity: 'Low' }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-[120rem] mx-auto px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg font-paragraph text-gray-600">
              Monitor platform usage and student engagement metrics
            </p>
            {hasDevSession() && (
              <div className="mt-2 bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-1 inline-block">
                <span className="text-xs font-paragraph text-yellow-800">
                  🔧 Development Admin Session Active
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            {hasDevSession() && (
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-3 rounded-lg font-paragraph font-medium hover:bg-red-700 transition-colors inline-flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-paragraph text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-heading font-bold text-foreground">{stats.totalUsers.toLocaleString()}</p>
                <p className="font-paragraph text-sm text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-paragraph text-sm text-gray-600 mb-1">Active Users</p>
                <p className="text-3xl font-heading font-bold text-foreground">{stats.activeUsers}</p>
                <p className="font-paragraph text-sm text-green-600 mt-1">+8% from yesterday</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-paragraph text-sm text-gray-600 mb-1">Total Sessions</p>
                <p className="text-3xl font-heading font-bold text-foreground">{stats.totalSessions}</p>
                <p className="font-paragraph text-sm text-green-600 mt-1">+15% from last week</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-paragraph text-sm text-gray-600 mb-1">Emergency Alerts</p>
                <p className="text-3xl font-heading font-bold text-destructive">{stats.emergencyAlerts}</p>
                <p className="font-paragraph text-sm text-gray-600 mt-1">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Active Users Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-heading font-bold text-foreground mb-6">Daily Active Users</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyActiveUsers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }} 
                />
                <Bar dataKey="users" fill="#A7D1E8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Session Types Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-heading font-bold text-foreground mb-6">Session Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sessionTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sessionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {sessionTypes.map((type, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
                  <span className="font-paragraph text-sm text-gray-600">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Issues */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-heading font-bold text-foreground mb-6">Top Issues</h3>
            <div className="space-y-4">
              {topIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-paragraph font-medium text-foreground">{issue.issue}</span>
                      <span className="font-paragraph text-sm text-gray-600">{issue.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${issue.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Trends */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-heading font-bold text-foreground mb-6">Weekly Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }} 
                />
                <Line type="monotone" dataKey="chatSessions" stroke="#A7D1E8" strokeWidth={3} dot={{ fill: '#A7D1E8', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="bookings" stroke="#2E4A62" strokeWidth={3} dot={{ fill: '#2E4A62', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="forumPosts" stroke="#E8A7A7" strokeWidth={3} dot={{ fill: '#E8A7A7', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="font-paragraph text-sm text-gray-600">Chat Sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-dark-blue rounded-full"></div>
                <span className="font-paragraph text-sm text-gray-600">Bookings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="font-paragraph text-sm text-gray-600">Forum Posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-heading font-bold text-foreground">Recent Emergency Alerts</h3>
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-paragraph text-sm">
              {emergencyAlerts.filter(alert => alert.status !== 'Resolved').length} Active
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-paragraph font-medium text-gray-600 pb-3">Timestamp</th>
                  <th className="text-left font-paragraph font-medium text-gray-600 pb-3">Type</th>
                  <th className="text-left font-paragraph font-medium text-gray-600 pb-3">Severity</th>
                  <th className="text-left font-paragraph font-medium text-gray-600 pb-3">Status</th>
                  <th className="text-left font-paragraph font-medium text-gray-600 pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {emergencyAlerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-gray-50">
                    <td className="py-4 font-paragraph text-sm text-gray-700">{alert.timestamp}</td>
                    <td className="py-4 font-paragraph text-sm text-gray-700">{alert.type}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full font-paragraph text-xs ${
                        alert.severity === 'High' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full font-paragraph text-xs ${
                        alert.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        alert.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {alert.status !== 'Resolved' && (
                        <button className="bg-primary text-primary-foreground px-3 py-1 rounded-lg font-paragraph text-xs hover:bg-primary/90 transition-colors">
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}