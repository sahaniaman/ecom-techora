import SectionWrapper from '@/components/wrappers/SectionWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ShoppingBag, TrendingUp, DollarSign, Package, Eye, ShoppingCart, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import getDashboardStats from '@/data/users/superadmin/getDashboardStats'
import getRecentActivity from '@/data/users/superadmin/getRecentActivity'
import getTopProducts from '@/data/users/superadmin/getTopProducts'

const page = async () => {
  try {
    // Fetch real data
    const [dashboardStats, recentActivity, topProducts] = await Promise.all([
      getDashboardStats(),
      getRecentActivity(),
      getTopProducts(),
    ]);

  const stats = [
    {
      title: "Total Revenue",
      value: "$0.00",
      change: "+0%",
      trend: "up",
      icon: DollarSign,
      description: "Orders coming soon",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30"
    },
    {
      title: "Total Users",
      value: dashboardStats.totalUsers.toLocaleString(),
      change: `+${dashboardStats.newUsersThisMonth}`,
      trend: "up",
      icon: Users,
      description: "new this month",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      title: "Active Users",
      value: dashboardStats.activeUsers.toLocaleString(),
      change: `${dashboardStats.suspendedUsers} suspended`,
      trend: "up",
      icon: ShoppingBag,
      description: `${dashboardStats.pendingUsers} pending`,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30"
    },
    {
      title: "Active Products",
      value: dashboardStats.totalProducts.toLocaleString(),
      change: `+${dashboardStats.newProductsThisWeek}`,
      trend: "up",
      icon: Package,
      description: "added this week",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30"
    },
  ]

  return (
    <SectionWrapper
      navbarSpacing='none'
      maxWidth='full'
      padding='md'
      background='transparent'
      className='min-h-screen w-full bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/20'
    >
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title} 
              className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`${stat.color} bg-transparent px-1.5`}>
                    {stat.change}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="border-none shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <CardDescription>Latest actions from your store</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div 
                    key={`${activity.user}-${activity.time}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-50 dark:bg-green-950/30' :
                        activity.status === 'cancelled' ? 'bg-red-50 dark:bg-red-950/30' :
                        activity.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-950/30' :
                        'bg-blue-50 dark:bg-blue-950/30'
                      }`}>
                        {activity.action.includes('order') ? <ShoppingCart className="h-4 w-4" /> :
                         activity.action.includes('user') ? <UserPlus className="h-4 w-4" /> :
                         <Package className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{activity.amount}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent activity yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-none shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Top Products</CardTitle>
                  <CardDescription>Best selling items this month</CardDescription>
                </div>
                <Eye className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topProducts.length > 0 ? topProducts.map((product) => (
                  <div key={product.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                      </div>
                      <p className="text-sm font-semibold">${product.price.toFixed(2)}</p>
                    </div>
                    <Progress value={product.progress} className="h-2" />
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No products available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
            <CardDescription className="text-blue-100">
              Common tasks to manage your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <button type="button" className="p-4 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 text-left group">
                <Users className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold">Manage Users</p>
                <p className="text-xs text-blue-100">View all users</p>
              </button>
              <button type="button" className="p-4 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 text-left group">
                <Package className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold">Add Product</p>
                <p className="text-xs text-blue-100">Create new item</p>
              </button>
              <button type="button" className="p-4 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 text-left group">
                <ShoppingBag className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold">View Orders</p>
                <p className="text-xs text-blue-100">Manage orders</p>
              </button>
              <button type="button" className="p-4 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 text-left group">
                <TrendingUp className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold">Analytics</p>
                <p className="text-xs text-blue-100">View reports</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  )
  } catch (error) {
    console.error("❌ Error loading dashboard:", error);
    
    return (
      <SectionWrapper
        navbarSpacing='none'
        maxWidth='full'
        padding='md'
        background='transparent'
        className='min-h-screen w-full bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/20'
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full border-none shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-red-600">Error Loading Dashboard</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "Failed to load dashboard data"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Technical Details
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {error instanceof Error ? error.stack : String(error)}
                </pre>
              </details>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
    );
  }
}

export default page