import React, { useState } from 'react';
import { BarChart3, PieChart, MapPin, TrendingUp, GraduationCap, Building2, Users, Target } from 'lucide-react';

// Statistics data from universities_statistics.json
const STATISTICS = {
    total_universities: 26,
    cities_count: 10,
    cities_distribution: [
        { name: "Алматы", count: 10, percentage: 38.46 },
        { name: "Астана", count: 4, percentage: 15.38 },
        { name: "Караганда", count: 3, percentage: 11.54 },
        { name: "Семей", count: 2, percentage: 7.69 },
        { name: "Уральск", count: 2, percentage: 7.69 },
        { name: "Актобе", count: 1, percentage: 3.85 },
        { name: "Кокшетау", count: 1, percentage: 3.85 },
        { name: "Каскелен", count: 1, percentage: 3.85 },
        { name: "Шымкент", count: 1, percentage: 3.85 },
        { name: "Павлодар", count: 1, percentage: 3.85 },
    ],
    categories: [
        { name: "Многопрофильный", count: 10, percentage: 38.46, color: "bg-blue-500", icon: "🎓" },
        { name: "Инженерия и техника", count: 6, percentage: 23.08, color: "bg-orange-500", icon: "⚙️" },
        { name: "Медицина", count: 4, percentage: 15.38, color: "bg-red-500", icon: "🏥" },
        { name: "IT и технологии", count: 2, percentage: 7.69, color: "bg-purple-500", icon: "💻" },
        { name: "Бизнес и экономика", count: 2, percentage: 7.69, color: "bg-green-500", icon: "💰" },
        { name: "Искусство", count: 1, percentage: 3.85, color: "bg-pink-500", icon: "🎨" },
        { name: "Педагогика", count: 1, percentage: 3.85, color: "bg-yellow-500", icon: "📚" },
    ],
    ent_scores: {
        min: 50,
        max: 70,
        avg: 56.35
    },
    grants_info: {
        total_grants: 50000,
        competition: 3.5,
        success_rate: 28
    }
};

// Color palette for charts - balanced
const CITY_COLORS = [
    'bg-kz-blue',
    'bg-cyan-500',
    'bg-cyan-400',
    'bg-sky-400',
    'bg-slate-300',
    'bg-slate-300',
    'bg-slate-200',
    'bg-slate-200',
    'bg-slate-200',
    'bg-slate-200',
];

const AnalyticsDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'cities' | 'categories' | 'ent'>('cities');

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                    <div className="bg-cyan-50 p-3 rounded-xl border border-cyan-100">
                        <BarChart3 className="text-kz-blue w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-slate-800 font-bold text-xl">Аналитика вузов</h2>
                        <p className="text-slate-400 text-sm">Статистика по {STATISTICS.total_universities} университетам</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white border-b border-slate-100">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 border border-slate-200">
                        <Building2 className="w-5 h-5 text-slate-700" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{STATISTICS.total_universities}</div>
                    <div className="text-xs text-slate-500">Вузов</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 border border-slate-200">
                        <MapPin className="w-5 h-5 text-slate-700" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{STATISTICS.cities_count}</div>
                    <div className="text-xs text-slate-500">Городов</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 border border-slate-200">
                        <GraduationCap className="w-5 h-5 text-slate-700" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">50k+</div>
                    <div className="text-xs text-slate-500">Грантов</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 border border-slate-200">
                        <Target className="w-5 h-5 text-slate-700" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{STATISTICS.ent_scores.avg}</div>
                    <div className="text-xs text-slate-500">Средний балл</div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-5 flex-1 overflow-y-auto">
                {/* Cities Tab */}
                {activeTab === 'cities' && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-800 mb-4">Распределение вузов по городам</h3>
                        {STATISTICS.cities_distribution.map((city, idx) => (
                            <div key={city.name} className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-slate-700">{city.name}</span>
                                    <span className="text-sm text-slate-500">{city.count} вузов ({city.percentage}%)</span>
                                </div>
                                <div className="h-6 bg-slate-100 rounded-lg overflow-hidden">
                                    <div
                                        className={`h-full ${CITY_COLORS[idx]} rounded-lg transition-all duration-500 flex items-center justify-end pr-2`}
                                        style={{ width: `${city.percentage * 2.5}%`, minWidth: '30px' }}
                                    >
                                        <span className="text-white text-xs font-bold">{city.count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-800 mb-4">Распределение по направлениям</h3>
                        <div className="grid gap-3">
                            {STATISTICS.categories.map((cat) => (
                                <div
                                    key={cat.name}
                                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    <div className="text-2xl grayscale opacity-60">{cat.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-800 truncate">{cat.name}</div>
                                        <div className="h-2 bg-slate-50 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className={`h-full bg-kz-blue rounded-full transition-all duration-500`}
                                                style={{ width: `${cat.percentage * 2.5}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-800">{cat.count}</div>
                                        <div className="text-xs text-slate-500">{cat.percentage}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ENT Scores Tab */}
                {activeTab === 'ent' && (
                    <div className="space-y-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Требования по баллам ЕНТ</h3>

                        {/* Score Range */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <div className="text-center mb-4">
                                <div className="text-sm text-slate-500 mb-1">Диапазон проходных баллов</div>
                                <div className="text-3xl font-bold text-slate-800">
                                    {STATISTICS.ent_scores.min} — {STATISTICS.ent_scores.max}
                                </div>
                            </div>
                            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="absolute h-full bg-gradient-to-r from-cyan-300 via-kz-blue to-blue-600 rounded-full"
                                    style={{ left: `${STATISTICS.ent_scores.min / 1.4}%`, width: `${(STATISTICS.ent_scores.max - STATISTICS.ent_scores.min) / 1.4}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 mt-2">
                                <span>0</span>
                                <span>50</span>
                                <span>100</span>
                                <span>140</span>
                            </div>
                        </div>

                        {/* Score Categories */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white p-4 rounded-xl text-center border border-slate-100 shadow-sm">
                                <div className="text-2xl mb-1 grayscale opacity-70">🔴</div>
                                <div className="font-bold text-slate-700">50-60</div>
                                <div className="text-xs text-slate-500">Базовый</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl text-center border border-slate-100 shadow-sm">
                                <div className="text-2xl mb-1 grayscale opacity-70">🟡</div>
                                <div className="font-bold text-slate-700">60-80</div>
                                <div className="text-xs text-slate-500">Средний</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl text-center border border-slate-100 shadow-sm">
                                <div className="text-2xl mb-1 grayscale opacity-70">🟢</div>
                                <div className="font-bold text-slate-700">80+</div>
                                <div className="text-xs text-slate-500">Высокий</div>
                            </div>
                        </div>

                        {/* Insights */}
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <h4 className="font-semibold text-slate-800 mb-3">💡 Интересные факты</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>• Медицинские вузы требуют минимум 70 баллов</li>
                                <li>• Nazarbayev University — от 100 баллов + IELTS</li>
                                <li>• Средний проходной балл — {STATISTICS.ent_scores.avg}</li>
                                <li>• IT-специальности набирают популярность</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
