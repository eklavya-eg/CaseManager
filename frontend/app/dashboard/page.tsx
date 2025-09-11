"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, FileText, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Dummy data for charts
const caseData = [
  { month: 'Jan', cases: 45, resolved: 38 },
  { month: 'Feb', cases: 52, resolved: 41 },
  { month: 'Mar', cases: 48, resolved: 44 },
  { month: 'Apr', cases: 61, resolved: 52 },
  { month: 'May', cases: 55, resolved: 49 },
  { month: 'Jun', cases: 67, resolved: 58 },
];

const performanceData = [
  { month: 'Jan', accuracy: 92 },
  { month: 'Feb', accuracy: 94 },
  { month: 'Mar', accuracy: 91 },
  { month: 'Apr', accuracy: 96 },
  { month: 'May', accuracy: 93 },
  { month: 'Jun', accuracy: 97 },
];

const categoryData = [
  { name: 'Legal', value: 35, color: '#3B82F6' },
  { name: 'Medical', value: 28, color: '#8B5CF6' },
  { name: 'Financial', value: 22, color: '#10B981' },
  { name: 'Insurance', value: 15, color: '#F59E0B' },
];

const stats = [
  {
    title: 'Total Cases',
    value: '328',
    change: '+12%',
    trend: 'up',
    icon: FileText,
    color: 'blue'
  },
  {
    title: 'Active Users',
    value: '1,234',
    change: '+8%',
    trend: 'up',
    icon: Users,
    color: 'green'
  },
  {
    title: 'Model Accuracy',
    value: '97.2%',
    change: '+2.1%',
    trend: 'up',
    icon: Target,
    color: 'purple'
  },
  {
    title: 'Resolution Rate',
    value: '89.5%',
    change: '-1.2%',
    trend: 'down',
    icon: TrendingUp,
    color: 'orange'
  },
];

export default function Dashboard() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-slate-600">
          Monitor your case management performance and analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ml-1 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${
                  stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
                  stat.color === 'green' ? 'from-green-500 to-green-600' :
                  stat.color === 'purple' ? 'from-purple-500 to-purple-600' :
                  'from-orange-500 to-orange-600'
                }`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Case Volume Chart */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Case Volume Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={caseData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="cases" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Model Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis domain={[85, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Case Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New model uploaded', time: '2 minutes ago', status: 'success' },
                { action: 'Data processing completed', time: '15 minutes ago', status: 'success' },
                { action: 'Case #1234 resolved', time: '1 hour ago', status: 'info' },
                { action: 'Weekly report generated', time: '2 hours ago', status: 'info' },
                { action: 'System backup completed', time: '4 hours ago', status: 'success' },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.action}</p>
                    <p className="text-xs text-slate-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}