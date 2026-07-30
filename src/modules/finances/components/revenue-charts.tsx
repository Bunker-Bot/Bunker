import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

interface RevenueChartsProps {
  summary: {
    totalCost: number;
    totalPaid: number;
    remainingBalance: number;
    paymentPercentage: number;
    averagePayment: number;
    largestPayment: number;
  };
  payments: any[];
}

const COLORS = {
  collected: '#34D399', // Emerald
  remaining: '#38BDF8', // Sky
};

const PIE_COLORS = ['#34D399', '#38BDF8', '#FBBF24', '#A78BFA', '#F43F5E', '#71717A'];

export const RevenueCharts: React.FC<RevenueChartsProps> = ({ summary, payments }) => {
  const hasPayments = payments.length > 0;

  // 1. Donut Chart Data
  const donutData = [
    { name: 'Collected', value: summary.totalPaid, color: COLORS.collected },
    { name: 'Remaining', value: summary.remainingBalance, color: COLORS.remaining },
  ];

  // 2. Real Payment Accumulation Trend Area Chart Data
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
  );

  let runningTotal = 0;
  const trendData = sortedPayments.map((p) => {
    runningTotal += p.amount;
    return {
      date: new Date(p.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: p.amount,
      accumulated: runningTotal,
    };
  });

  // 3. Real Monthly Revenue Bar Chart Data
  const monthlyCounts: Record<string, number> = {};
  sortedPayments.forEach((p) => {
    const month = new Date(p.paymentDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthlyCounts[month] = (monthlyCounts[month] || 0) + p.amount;
  });

  const monthlyData = Object.entries(monthlyCounts).map(([month, amount]) => ({
    month,
    amount,
  }));

  // 4. Real Contract Burn-down Line Data (Actual Budget Remaining over time)
  let remainingBudget = summary.totalCost;
  const burndownData = [
    { stage: 'Start', budget: summary.totalCost, remaining: summary.totalCost },
    ...sortedPayments.map((p, idx) => {
      remainingBudget = Math.max(0, remainingBudget - p.amount);
      return {
        stage: `Pay #${idx + 1}`,
        budget: summary.totalCost,
        remaining: remainingBudget,
      };
    }),
  ];

  // 5. Real Payment Method Distribution Pie Data
  const methodCounts: Record<string, number> = {};
  payments.forEach((p: any) => {
    const method = p.paymentMethod || 'Bank Transfer';
    methodCounts[method] = (methodCounts[method] || 0) + p.amount;
  });

  const distributionData = Object.entries(methodCounts).map(([name, value]) => ({
    name,
    value,
  }));

  if (!hasPayments && summary.totalCost === 0) {
    return (
      <div className="p-6 rounded-sm bg-zinc-900 border border-zinc-800 text-center text-zinc-500 font-mono text-xs">
        No payment transactions or contract budget set yet to generate revenue analytics.
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Top 2 Main Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Donut Revenue Breakdown with Center Label (5 Cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-white text-xs">Revenue Breakdown</span>
            <span className="text-[10px] text-zinc-500 font-sans">Contract Share</span>
          </div>

          <div className="relative h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="#09090B" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', color: '#FFF', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-white tracking-tight">{summary.paymentPercentage}%</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Collected</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-zinc-850 pt-3 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Collected: <strong className="text-white font-mono">₹{summary.totalPaid.toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Remaining: <strong className="text-white font-mono">₹{summary.remainingBalance.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Payment Trend Area Chart (7 Cols) */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-white text-xs">Payment Accumulation Trend</span>
            <span className="text-[10px] text-emerald-400 font-mono">{payments.length} Payments</span>
          </div>

          {trendData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34D399" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#71717A" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', color: '#FFF', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="accumulated" stroke="#34D399" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-zinc-500 text-xs">
              Record a payment to view accumulation trend chart.
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-sans border-t border-zinc-850 pt-2">
            <span>Average Payment: <strong className="text-zinc-200 font-mono">₹{summary.averagePayment.toLocaleString()}</strong></span>
            <span>Largest Payment: <strong className="text-emerald-400 font-mono">₹{summary.largestPayment.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Bottom Secondary Charts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue Bar */}
        <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-2 shadow-sm">
          <span className="font-bold text-white text-xs block border-b border-zinc-800 pb-1.5">Monthly Revenue</span>
          {monthlyData.length > 0 ? (
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" stroke="#71717A" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', color: '#FFF', fontSize: '10px' }} />
                  <Bar dataKey="amount" fill="#38BDF8" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-zinc-500 text-xs">
              No monthly data available
            </div>
          )}
        </div>

        {/* Contract Burn-down Line */}
        <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-2 shadow-sm">
          <span className="font-bold text-white text-xs block border-b border-zinc-800 pb-1.5">Contract Burn-down</span>
          {burndownData.length > 0 ? (
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndownData}>
                  <XAxis dataKey="stage" stroke="#71717A" fontSize={8} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', color: '#FFF', fontSize: '10px' }} />
                  <Line type="monotone" dataKey="budget" stroke="#71717A" strokeDasharray="3 3" dot={false} />
                  <Line type="monotone" dataKey="remaining" stroke="#FBBF24" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-zinc-500 text-xs">
              No burndown data available
            </div>
          )}
        </div>

        {/* Payment Method Distribution Pie */}
        <div className="p-3.5 sm:p-4 rounded-sm bg-zinc-900/90 border border-zinc-800 space-y-2 shadow-sm">
          <span className="font-bold text-white text-xs block border-b border-zinc-800 pb-1.5">Payment Method Share</span>
          {distributionData.length > 0 ? (
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} cx="50%" cy="50%" outerRadius={45} dataKey="value">
                    {distributionData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke="#09090B" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', color: '#FFF', fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-zinc-500 text-xs">
              No payment methods recorded
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
