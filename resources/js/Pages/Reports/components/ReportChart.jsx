import React from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell,
    ComposedChart, ScatterChart, Scatter, ZAxis
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#06b6d4', '#8b5cf6'];

const ReportChart = ({ type = 'line', data, xKey, yKeys = [], colors = COLORS, height = 300, title }) => {

    if (!data || data.length === 0) {
        return (
            <div className="chart-placeholder flex flex-col items-center justify-center p-12 text-slate-400" style={{ height }}>
                <p className="text-sm font-medium">No data available for the selected period</p>
            </div>
        );
    }

    const renderChart = () => {
        switch (type) {
            case 'line':
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                        {yKeys.map((key, i) => (
                            <Line
                                key={key.name}
                                type="monotone"
                                dataKey={key.name}
                                stroke={colors[i % colors.length]}
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name={key.label}
                            />
                        ))}
                    </LineChart>
                );
            case 'bar':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f8fafc' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                        {yKeys.map((key, i) => (
                            <Bar
                                key={key.name}
                                dataKey={key.name}
                                fill={colors[i % colors.length]}
                                radius={[4, 4, 0, 0]}
                                name={key.label}
                                barSize={40}
                            />
                        ))}
                    </BarChart>
                );
            case 'scatter':
                return (
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey={xKey}
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            dy={10}
                            allowDuplicatedCategory={false}
                        />
                        <YAxis
                            dataKey={yKeys[0]?.name}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <ZAxis range={[80, 80]} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            cursor={{ strokeDasharray: '3 3' }}
                        />
                        {yKeys.map((key, i) => (
                            <Scatter
                                key={key.name}
                                name={key.label}
                                data={data}
                                dataKey={key.name}
                                fill={colors[i % colors.length]}
                            />
                        ))}
                    </ScatterChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey={xKey}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                    </PieChart>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full">
            {title && <h4 className="text-sm font-semibold text-slate-700 mb-4">{title}</h4>}
            <div style={{ width: '100%', height }}>
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ReportChart;
