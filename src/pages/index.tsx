import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  FileText,
  User,
  CreditCard,
  Wrench,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  ArrowRight,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Revenue',
      value: '$847,290',
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Properties',
      value: '142',
      change: '+3.2%',
      changeType: 'increase' as const,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Leases',
      value: '89',
      change: '+8.1%',
      changeType: 'increase' as const,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Occupancy Rate',
      value: '94.2%',
      change: '+2.4%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Property',
      description: 'Register a new property in your portfolio',
      href: '/properties',
      icon: Building2,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Create Lease Agreement',
      description: 'Set up a new lease for tenants',
      href: '/leases',
      icon: FileText,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Record Payment',
      description: 'Log a new rent payment',
      href: '/payments',
      icon: CreditCard,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Maintenance Request',
      description: 'Create a new maintenance request',
      href: '/maintenance',
      icon: Wrench,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'Payment Received',
      description: '$2,400 from John Doe - Apartment 4B',
      time: '2 hours ago',
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 2,
      title: 'New Lease Signed',
      description: 'Sarah Johnson signed lease for Unit 12A',
      time: '4 hours ago',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 3,
      title: 'Maintenance Completed',
      description: 'HVAC repair completed at Building C',
      time: '6 hours ago',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 4,
      title: 'Property Listed',
      description: 'Ocean View Apartment added to portfolio',
      time: '1 day ago',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const navigationCards = [
    {
      title: 'Property Owners',
      description: 'Manage owner information and portfolios',
      href: '/owners',
      icon: Users,
      stats: '24 Active',
      color: 'border-blue-200 hover:border-blue-300'
    },
    {
      title: 'Properties',
      description: 'View and manage all properties',
      href: '/properties',
      icon: Building2,
      stats: '142 Units',
      color: 'border-green-200 hover:border-green-300'
    },
    {
      title: 'Lease Management',
      description: 'Track and manage lease agreements',
      href: '/leases',
      icon: FileText,
      stats: '89 Active',
      color: 'border-purple-200 hover:border-purple-300'
    },
    {
      title: 'Tenants',
      description: 'Manage tenant information and history',
      href: '/tenants',
      icon: User,
      stats: '156 Tenants',
      color: 'border-indigo-200 hover:border-indigo-300'
    },
    {
      title: 'Payments',
      description: 'Track rent payments and financial records',
      href: '/payments',
      icon: CreditCard,
      stats: '$847K Collected',
      color: 'border-yellow-200 hover:border-yellow-300'
    },
    {
      title: 'Financial Reports',
      description: 'View comprehensive financial analytics',
      href: '/financial',
      icon: BarChart3,
      stats: '94.2% Collection',
      color: 'border-pink-200 hover:border-pink-300'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                Property Management Hub
              </h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Plus className="w-5 h-5 inline mr-2" />
                Quick Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/60 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {stat.value}
                </h3>
                <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className={`bg-gradient-to-r ${action.color} p-6 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer group`}>
                  <action.icon className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                  <p className="text-white/90 text-sm">{action.description}</p>
                  <ArrowRight className="w-5 h-5 mt-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <Link href="/activity" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50/50 transition-colors">
                    <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Portfolio Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">142</div>
                    <div className="text-sm text-blue-600">Total Properties</div>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <div>
                    <div className="text-2xl font-bold text-green-600">94.2%</div>
                    <div className="text-sm text-green-600">Occupancy Rate</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">$847K</div>
                    <div className="text-sm text-purple-600">Monthly Revenue</div>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Your Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationCards.map((card, index) => (
              <Link key={index} href={card.href}>
                <div className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 ${card.color} hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
                  <div className="flex items-center justify-between mb-4">
                    <card.icon className="w-8 h-8 text-gray-700 group-hover:text-blue-600 transition-colors" />
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{card.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">{card.stats}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-500">Active</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Alert Banner */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">Attention Required</h3>
              <p className="text-sm text-amber-700 mt-1">
                You have 3 lease renewals due this month and 2 maintenance requests pending approval.
              </p>
              <div className="mt-3 flex space-x-3">
                <Link href="/leases" className="text-sm font-medium text-amber-800 hover:text-amber-900">
                  Review Leases →
                </Link>
                <Link href="/maintenance" className="text-sm font-medium text-amber-800 hover:text-amber-900">
                  View Requests →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;