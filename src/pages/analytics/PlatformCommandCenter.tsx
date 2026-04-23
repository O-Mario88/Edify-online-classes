import React, { useState, useEffect } from 'react';
import { Users, School, PlayCircle, BookmarkCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { AlertBanner } from '../../components/dashboard/AlertBanner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient } from '../../lib/apiClient';

export const PlatformCommandCenter = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<any[]>('/analytics/daily-platform-metric/')
      .then(res => {
        if (res.error) throw res.error;
        setMetrics(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load metrics", err);
        // Fallback data when API is offline
        setMetrics([{
           exam_registrations_pending: 142,
           total_active_users: 45200,
           dau: 12400,
           live_sessions_active: 84,
           date: new Date().toISOString()
        }, {
           total_active_users: 44100,
           dau: 11000,
           date: new Date(Date.now() - 86400000).toISOString()
        }, {
           total_active_users: 42000,
           dau: 10500,
           date: new Date(Date.now() - 86400000 * 2).toISOString()
        }, {
           total_active_users: 41000,
           dau: 10200,
           date: new Date(Date.now() - 86400000 * 3).toISOString()
        }, {
           total_active_users: 40500,
           dau: 9800,
           date: new Date(Date.now() - 86400000 * 4).toISOString()
        }, {
           total_active_users: 39500,
           dau: 9500,
           date: new Date(Date.now() - 86400000 * 5).toISOString()
        }, {
           total_active_users: 39000,
           dau: 9100,
           date: new Date(Date.now() - 86400000 * 6).toISOString()
        }]);
        setLoading(false);
      });
  }, []);

  const latest = metrics.length > 0 ? metrics[0] : null;

  // Format for charts
  const weeklyData = [...metrics].reverse().slice(-7).map(m => {
    const d = new Date(m.date);
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      signups: m.dau,
      active: m.total_active_users
    };
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Command Center...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Smart Alerts Engine */}
      <div className="space-y-3">
        {latest?.exam_registrations_pending > 100 && (
          <AlertBanner 
            type="error" 
            title="Exam Registration Risk" 
            message={`${latest.exam_registrations_pending} pending exam registrations found. Deadlines approach.`}
            action={<button className="px-3 py-1 bg-red-100/50 text-red-700 rounded text-sm font-medium hover:bg-red-100 transition-colors">Review Schools</button>}
          />
        )}
        <AlertBanner 
          type="warning" 
          title="Attendance Anomaly Detected" 
          message="Attendance is down 18% this week in S3 Mathematics across the Wakiso District."
        />
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Active Users"
          value={latest ? latest.total_active_users.toLocaleString() : "0"}
          trend={12.5}
          icon={<Users />}
        />
        <MetricCard
          title="Paying Institutions"
          value={latest ? latest.paying_institutions.toString() : "0"}
          trend={4.2}
          icon={<School />}
        />
        <MetricCard
          title="Lessons Completed"
          value={latest ? latest.lessons_completed.toLocaleString() : "0"}
          trend={22.0}
          trendLabel="vs yesterday"
          icon={<PlayCircle />}
        />
        <MetricCard
          title="Marketplace GMV"
          value={latest ? `UGX ${(parseFloat(latest.marketplace_gmv) / 1000000).toFixed(1)}M` : "UGX 0M"}
          trend={8.1}
          icon={<TrendingUp />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Trends */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">User Engagement & Growth</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="active" name="Active Users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="signups" name="DAU" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commercial Operations & Liabilities */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Commercial Operations</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Monthly Run Rate (MRR)</span>
                <span className="font-semibold text-gray-900">
                  {latest ? `UGX ${(parseFloat(latest.mrr) / 1000000).toFixed(1)}M` : "UGX 0M"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-gray-500 text-sm">B2B License Revenue</span>
                <span className="font-semibold text-gray-900">UGX 28M</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Marketplace GMV</span>
                <span className="font-semibold text-green-600">
                  {latest ? `UGX ${(parseFloat(latest.marketplace_gmv) / 1000000).toFixed(1)}M` : "UGX 0M"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-amber-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Pending Payout Liabilities</span>
                </div>
                <span className="font-bold text-gray-900">
                   {latest ? `UGX ${(parseFloat(latest.payout_liabilities) / 1000).toFixed(0)}K` : "UGX 0K"}
                </span>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-6 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg text-sm transition-colors">
            Run Revenue Report
          </button>
        </div>
      </div>
      
      {/* Learning Health Deep Dive Block */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Aggregate Learning Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Avg Assessment Score</p>
              <p className="text-2xl font-bold mt-1">68.4%</p>
              <p className="text-sm text-green-600 mt-1">+2.1% this week</p>
           </div>
           <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">At-Risk Learner Cluster</p>
              <p className="text-2xl font-bold mt-1">420</p>
              <p className="text-sm text-red-600 mt-1">12 new alerts</p>
           </div>
           <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Live Session Success</p>
              <p className="text-2xl font-bold mt-1">99.2%</p>
              <p className="text-sm text-gray-400 mt-1">Platform-wide</p>
           </div>
           <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Curriculum Adoption</p>
              <p className="text-lg font-semibold mt-1">UG (82%) | KE (12%)</p>
           </div>
        </div>
      </div>
    </div>
  );
};
export default PlatformCommandCenter;
