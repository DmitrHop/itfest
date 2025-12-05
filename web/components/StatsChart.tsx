import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { University } from '../types';

interface StatsChartProps {
  universities: University[];
}

const StatsChart: React.FC<StatsChartProps> = ({ universities }) => {
  const data = universities.map(uni => ({
    name: uni.shortName,
    rating: uni.rating,
    employment: uni.employmentRate,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-96">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Рейтинг и Трудоустройство</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="rating" name="Рейтинг (0-100)" fill="#00AFCA" radius={[4, 4, 0, 0]} />
          <Bar dataKey="employment" name="Трудоустройство (%)" fill="#FEC50C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;