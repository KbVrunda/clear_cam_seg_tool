import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import TopBar from './TopBar';
import { mockAnalytics } from '../utils/mockData';

const COLORS = {
  green: '#10b981',
  red: '#ef4444',
  gray: '#6b7280',
  blue: '#3b82f6',
  orange: '#f97316',
};

export default function AnalyticsDashboard() {
  // Prepare stacked bar data
  const stackedBarData = mockAnalytics.stackedBarData.map((item) => ({
    project: item.project,
    Blood: item.Blood,
    Smoke: item.Smoke,
    Fluid: item.Fluid,
    Tissue: item.Tissue,
  }));

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Frames Analyzed</h3>
              <p className="text-3xl font-bold text-gray-800">{mockAnalytics.summary.totalFrames.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">% Clean Frames</h3>
              <p className="text-3xl font-bold text-green-600">{mockAnalytics.summary.cleanFramesPercent}%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Most Common Contaminant</h3>
              <p className="text-3xl font-bold text-red-600">{mockAnalytics.summary.mostCommonContaminant}</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Clean vs Dirty Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockAnalytics.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockAnalytics.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Contaminant Counts Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contaminant Counts</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockAnalytics.contaminantCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444">
                    {mockAnalytics.contaminantCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()] || '#8884d8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stacked Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contaminants by Project</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stackedBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="project" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Blood" stackId="a" fill={COLORS.red} />
                <Bar dataKey="Smoke" stackId="a" fill={COLORS.gray} />
                <Bar dataKey="Fluid" stackId="a" fill={COLORS.blue} />
                <Bar dataKey="Tissue" stackId="a" fill={COLORS.orange} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Trend Line Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dirty Frames Trend (Last 12 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockAnalytics.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="dirty" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

