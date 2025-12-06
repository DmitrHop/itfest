import React, { useState, useMemo } from 'react';
import { Calculator, GraduationCap, MapPin, Filter, TrendingUp, ChevronRight } from 'lucide-react';
import {
    UNIVERSITIES_DATA,
    CATEGORIES,
    CITIES,
    calculateGrantChance,
    filterUniversities,
    UniversityData
} from '../data/universitiesData';

interface CalculationResult {
    university: UniversityData;
    chance: number;
    level: 'high' | 'medium' | 'low';
}

const GrantCalculator: React.FC = () => {
    const [entScore, setEntScore] = useState<string>('75');
    const [category, setCategory] = useState<string>('Все категории');
    const [city, setCity] = useState<string>('Все города');
    const [showResults, setShowResults] = useState<boolean>(false);

    const results = useMemo<CalculationResult[]>(() => {
        const score = parseInt(entScore) || 0;
        if (score < 1 || score > 140) return [];

        const filtered = filterUniversities(UNIVERSITIES_DATA, category, city);

        const calculated = filtered.map(uni => {
            const { chance, level } = calculateGrantChance(score, uni.ent_min_score, uni.ent_max_score);
            return { university: uni, chance, level };
        });

        // Sort by chance descending
        return calculated.sort((a, b) => b.chance - a.chance);
    }, [entScore, category, city]);

    const handleCalculate = () => {
        const score = parseInt(entScore) || 0;
        if (score >= 1 && score <= 140) {
            setShowResults(true);
        }
    };

    const getLevelColor = (level: 'high' | 'medium' | 'low') => {
        switch (level) {
            case 'high': return 'bg-emerald-500';
            case 'medium': return 'bg-amber-500';
            case 'low': return 'bg-red-500';
        }
    };

    const getLevelBg = (level: 'high' | 'medium' | 'low') => {
        switch (level) {
            case 'high': return 'bg-emerald-50 border-emerald-200';
            case 'medium': return 'bg-amber-50 border-amber-200';
            case 'low': return 'bg-red-50 border-red-200';
        }
    };

    const getLevelEmoji = (level: 'high' | 'medium' | 'low') => {
        switch (level) {
            case 'high': return '🟢';
            case 'medium': return '🟡';
            case 'low': return '🔴';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <Calculator className="text-white w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-xl">Калькулятор грантов</h2>
                        <p className="text-emerald-100 text-sm">Узнай свои шансы на грант в вузах Казахстана</p>
                    </div>
                </div>
            </div>

            {/* Inputs */}
            <div className="p-5 space-y-4 bg-slate-50">
                {/* ENT Score */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        🎯 Твой балл ЕНТ
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="1"
                            max="140"
                            value={entScore}
                            onChange={(e) => {
                                setEntScore(e.target.value);
                                setShowResults(false);
                            }}
                            placeholder="Введи балл (1-140)"
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-lg font-semibold text-center"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                            из 140
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Filter className="w-4 h-4 inline mr-1" />
                            Категория
                        </label>
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setShowResults(false);
                            }}
                            className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Город
                        </label>
                        <select
                            value={city}
                            onChange={(e) => {
                                setCity(e.target.value);
                                setShowResults(false);
                            }}
                            className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                        >
                            {CITIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Calculate Button */}
                <button
                    onClick={handleCalculate}
                    disabled={!entScore || parseInt(entScore) < 1 || parseInt(entScore) > 140}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <TrendingUp className="w-5 h-5" />
                    Рассчитать шансы
                </button>
            </div>

            {/* Results */}
            {showResults && (
                <div className="p-5 border-t border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-emerald-500" />
                        Твои шансы ({results.length} вузов)
                    </h3>

                    {results.length === 0 ? (
                        <div className="text-center py-6 text-slate-500">
                            <p>Нет подходящих университетов по выбранным фильтрам</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {results.map((result, index) => (
                                <div
                                    key={result.university.id}
                                    className={`p-4 rounded-xl border-2 ${getLevelBg(result.level)} transition-all hover:shadow-md`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">{getLevelEmoji(result.level)}</span>
                                                <h4 className="font-semibold text-slate-800 truncate text-sm">
                                                    {result.university.name}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {result.university.city}
                                                </span>
                                                <span>•</span>
                                                <span>{result.university.category}</span>
                                            </div>
                                            <div className="mt-2 text-xs text-slate-600">
                                                Проходной: {result.university.ent_min_score}-{result.university.ent_max_score} баллов
                                            </div>
                                        </div>

                                        {/* Chance indicator */}
                                        <div className="flex flex-col items-end">
                                            <div className="text-2xl font-bold text-slate-800">
                                                {result.chance}%
                                            </div>
                                            <div className={`text-xs px-2 py-0.5 rounded-full text-white ${getLevelColor(result.level)}`}>
                                                {result.level === 'high' ? 'Высокий' : result.level === 'medium' ? 'Средний' : 'Низкий'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getLevelColor(result.level)} transition-all duration-500`}
                                            style={{ width: `${result.chance}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Legend */}
                    <div className="mt-4 pt-4 border-t border-slate-200 flex justify-center gap-6 text-xs text-slate-500">
                        <span>🟢 Высокий (75%+)</span>
                        <span>🟡 Средний (45-74%)</span>
                        <span>🔴 Низкий (&lt;45%)</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GrantCalculator;
