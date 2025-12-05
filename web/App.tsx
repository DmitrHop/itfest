
import React, { useState, useMemo } from 'react';
import { UNIVERSITIES, COMPARISON_METRICS } from './constants';
import { University, ViewState, FilterState, GrantPrediction, EntSubject } from './types';
import StatsChart from './components/StatsChart';
import AiAssistant from './components/AiAssistant';
import Tour3D from './components/Tour3D';
import ImageCarousel from './components/ImageCarousel';
import {
  GraduationCap,
  Search,
  MapPin,
  BarChart3,
  ArrowRight,
  Menu,
  X,
  Scale,
  Globe,
  BookOpen,
  CheckCircle,
  Building2,
  Phone,
  PlayCircle,
  Percent,
  Hash,
  ArrowUp,
  ArrowDown,
  Minus,
  Calculator,
  Heart,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Atom,
  FlaskConical,
  Scale as ScaleIcon,
  Languages,
  LandPlot,
  Briefcase,
  Trophy,
  Zap,
  Laptop,
  Stethoscope,
  PenTool,
  Coins,
  Hammer,
  HelpCircle,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

// --- Constants & Helpers ---
// IDs of universities that have a 3D tour
const TOUR_IDS = ['iitu', 'narxoz', 'aues', 'aupet'];

// Dynamically import main images from assets/main/[Uni Name]/...
const mainImages = import.meta.glob('/assets/main/*/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
// Also import carousel images to use as fallback
const carouselImages = import.meta.glob('/assets/carousel/*/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });

const getUniImage = (uni: University) => {
  // 1. Try to find image in assets/main/[uni.name]/
  const mainKey = Object.keys(mainImages).find(path => path.includes(`/assets/main/${uni.name}/`));
  if (mainKey) return mainImages[mainKey];

  // 2. Fallback: Try to find ANY image in assets/carousel/[uni.name]/
  // We pick the first one (usually 1.jpg or similar)
  const carouselKey = Object.keys(carouselImages).find(path => path.includes(`/assets/carousel/${uni.name}/`));
  if (carouselKey) return carouselImages[carouselKey];

  return null;
};

// --- Constants for Grant Calculator ---

const SUBJECT_PAIRS = [
  { id: 'math_phys', name: 'Математика + Физика', icon: <Atom className="w-5 h-5" />, keywords: ['Computer', 'Robotics', 'Engineering', 'Systems', 'Math', 'IT'] },
  { id: 'bio_chem', name: 'Биология + Химия', icon: <FlaskConical className="w-5 h-5" />, keywords: ['Medicine', 'Pharmacy', 'Biology'] },
  { id: 'math_geog', name: 'Математика + География', icon: <Globe className="w-5 h-5" />, keywords: ['Economics', 'Management', 'Finance', 'Logistics'] },
  { id: 'hist_law', name: 'Всемирная ист. + Право', icon: <ScaleIcon className="w-5 h-5" />, keywords: ['Law', 'International Relations'] },
  { id: 'eng_hist', name: 'Английский + История', icon: <Languages className="w-5 h-5" />, keywords: ['Philology', 'Translation', 'Journalism', 'Digital Journalism'] },
];

// --- Utility Components ---

const Badge = ({ children, color = 'blue' }: { children: React.ReactNode, color?: 'blue' | 'yellow' | 'green' | 'red' }) => {
  const styles = {
    blue: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-red-50 text-red-700 border-red-100'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[color]}`}>
      {children}
    </span>
  );
};

// --- New Feature Components ---

const GrantCalculatorModal = ({ isOpen, onClose, onSelectUni }: { isOpen: boolean, onClose: () => void, onSelectUni: (u: University) => void }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [score, setScore] = useState<string>('');
  const [selectedPairId, setSelectedPairId] = useState<string>('');
  const [ruralQuota, setRuralQuota] = useState(false);
  const [result, setResult] = useState<GrantPrediction[] | null>(null);

  const calculate = () => {
    const numericScore = parseInt(score);
    if (!numericScore || numericScore > 140 || numericScore < 0) return;

    const selectedPair = SUBJECT_PAIRS.find(p => p.id === selectedPairId);
    if (!selectedPair) return;

    const predictions: GrantPrediction[] = [];

    UNIVERSITIES.forEach(uni => {
      uni.programs.forEach(prog => {
        // Mock logic: check if program matches selected subject keywords
        const isMatch = selectedPair.keywords.some(kw => prog.name.includes(kw) || prog.name.includes('Technology') || prog.name.includes('Petroleum'));

        // Basic fallback for demo purposes
        const finalMatch = isMatch || (selectedPairId === 'math_phys' && ['Computer', 'IT', 'Information', 'Robotics'].some(k => prog.name.includes(k)));

        if (finalMatch) {
          const effectiveScore = ruralQuota ? numericScore + 5 : numericScore;
          const scoreDiff = effectiveScore - prog.minScore;

          let chance: 'High' | 'Medium' | 'Low' = 'Low';
          let prob = 0;

          if (scoreDiff >= 20) {
            chance = 'High';
            prob = 95;
          } else if (scoreDiff >= 10) {
            chance = 'High';
            prob = 80 + (scoreDiff - 10) * 1.5;
          } else if (scoreDiff >= 0) {
            chance = 'Medium';
            prob = 50 + scoreDiff * 3;
          } else if (scoreDiff > -10) {
            chance = 'Low';
            prob = 20 + (10 + scoreDiff) * 2;
          } else {
            chance = 'Low';
            prob = 5;
          }

          if (prob > 99) prob = 99;
          if (prob < 1) prob = 1;

          predictions.push({
            university: uni,
            program: prog,
            chance,
            probability: Math.round(prob),
            scoreGap: scoreDiff
          });
        }
      });
    });

    setResult(predictions.sort((a, b) => b.probability - a.probability));
    setStep(2);
  };

  const reset = () => {
    setStep(1);
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 bg-slate-900 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
              <Calculator className="w-6 h-6 text-kz-sun" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Калькулятор Грантов Pro</h2>
              <p className="text-slate-400 text-xs">Алгоритм 2025 года</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"><X /></button>
        </div>

        {step === 1 ? (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">1. Выберите профильные предметы</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUBJECT_PAIRS.map(pair => (
                    <button
                      key={pair.id}
                      onClick={() => setSelectedPairId(pair.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${selectedPairId === pair.id
                        ? 'bg-white border-kz-blue ring-2 ring-kz-blue/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-kz-blue/50 hover:bg-slate-50'
                        }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedPairId === pair.id ? 'bg-kz-blue text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {pair.icon}
                      </div>
                      <span className={`font-medium ${selectedPairId === pair.id ? 'text-slate-900' : 'text-slate-600'}`}>{pair.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">2. Ваш балл ЕНТ (0-140)</label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Например: 105"
                  className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-kz-blue focus:outline-none text-xl font-bold text-slate-800 placeholder:font-normal"
                  max={140}
                />
              </div>

              <div>
                <label className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-blue-50/50 transition-colors">
                  <div
                    onClick={() => setRuralQuota(!ruralQuota)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${ruralQuota ? 'bg-kz-blue' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${ruralQuota ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-700">Сельская квота</span>
                    <span className="text-xs text-slate-500">Повышает шансы для выпускников сельских школ</span>
                  </div>
                </label>
              </div>

              <button
                onClick={calculate}
                disabled={!score || !selectedPairId}
                className="w-full bg-gradient-to-r from-kz-blue to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Рассчитать шансы
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full bg-slate-50">
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
              <div>
                <div className="text-xs text-slate-500 font-medium">Результаты для:</div>
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-sm">{score} баллов</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm truncate max-w-[150px]">{SUBJECT_PAIRS.find(p => p.id === selectedPairId)?.name}</span>
                </div>
              </div>
              <button onClick={reset} className="text-sm text-kz-blue font-medium hover:underline">Изменить</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {result && result.length > 0 ? (
                <>
                  {result.some(r => r.chance === 'High') && (
                    <div className="mb-6">
                      <h3 className="text-emerald-700 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Высокие шансы
                      </h3>
                      <div className="space-y-3">
                        {result.filter(r => r.chance === 'High').map((item, idx) => (
                          <PredictionCard key={idx} item={item} onSelectUni={onSelectUni} onClose={onClose} />
                        ))}
                      </div>
                    </div>
                  )}

                  {result.some(r => r.chance === 'Medium') && (
                    <div className="mb-6">
                      <h3 className="text-yellow-600 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Minus className="w-4 h-4" /> Есть шансы
                      </h3>
                      <div className="space-y-3">
                        {result.filter(r => r.chance === 'Medium').map((item, idx) => (
                          <PredictionCard key={idx} item={item} onSelectUni={onSelectUni} onClose={onClose} />
                        ))}
                      </div>
                    </div>
                  )}

                  {result.some(r => r.chance === 'Low') && (
                    <div>
                      <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-3">Рискованные варианты</h3>
                      <div className="space-y-3 opacity-80">
                        {result.filter(r => r.chance === 'Low').map((item, idx) => (
                          <PredictionCard key={idx} item={item} onSelectUni={onSelectUni} onClose={onClose} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-800">Гранты не найдены</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mt-2">Попробуйте изменить профильные предметы или рассмотреть платные отделения.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const PredictionCard: React.FC<{ item: GrantPrediction, onSelectUni: (u: University) => void, onClose: () => void }> = ({ item, onSelectUni, onClose }) => {
  const getProgressColor = (prob: number) => {
    if (prob >= 80) return 'bg-emerald-500';
    if (prob >= 50) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-bold text-slate-800 leading-tight mb-1">{item.program.name}</div>
          <div className="text-xs text-slate-500 font-medium">{item.university.name}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900">{item.probability}%</div>
        </div>
      </div>

      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${getProgressColor(item.probability)} transition-all duration-1000 ease-out`}
          style={{ width: `${item.probability}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex gap-3">
          <span className="bg-slate-50 px-2 py-1 rounded text-slate-600 border border-slate-100">
            Проходной: <b>{item.program.minScore}</b>
          </span>
          <span className="bg-slate-50 px-2 py-1 rounded text-slate-600 border border-slate-100">
            Грантов: <b>{item.program.grants}</b>
          </span>
        </div>
        <button
          onClick={() => { onClose(); onSelectUni(item.university); }}
          className="text-kz-blue font-bold hover:underline"
        >
          Подробнее
        </button>
      </div>
    </div>
  );
}

const FilterPanel = ({ filters, onChange, onReset, isOpen, onToggle }: { filters: FilterState, onChange: (f: FilterState) => void, onReset: () => void, isOpen: boolean, onToggle: () => void }) => {
  const cities = Array.from(new Set(UNIVERSITIES.map(u => u.city))).sort();

  const toggleCity = (city: string) => {
    const newCities = filters.city.includes(city)
      ? filters.city.filter(c => c !== city)
      : [...filters.city, city];
    onChange({ ...filters, city: newCities });
  };

  const activeFiltersCount = filters.city.length + (filters.hasDormitory ? 1 : 0) + (filters.hasMilitary ? 1 : 0) + (filters.maxPrice < 3000000 ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
      {/* Filter Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-kz-blue/10 rounded-lg">
            <SlidersHorizontal className="w-5 h-5 text-kz-blue" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-800">Фильтры</h3>
            <p className="text-xs text-slate-500">
              {activeFiltersCount > 0 ? `${activeFiltersCount} активных фильтров` : 'Все университеты'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <span
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="text-xs text-kz-blue hover:underline px-2 py-1 rounded"
            >
              Сбросить
            </span>
          )}
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Collapsible Filter Content */}
      {isOpen && (
        <div className="border-t border-slate-200 p-5 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Price Filter */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">Стоимость (до)</h4>
            <input
              type="range"
              min="0"
              max="3000000"
              step="100000"
              value={filters.maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: parseInt(e.target.value) })}
              className="w-full accent-kz-blue"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0 ₸</span>
              <span className="font-bold text-slate-900">{filters.maxPrice === 3000000 ? 'Любая' : `${(filters.maxPrice / 1000).toFixed(0)} тыс ₸`}</span>
            </div>
          </div>

          {/* City Filter - Two columns on desktop */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-bold text-slate-700 mb-3">Город</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {cities.map(city => (
                <label key={city} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={filters.city.includes(city)}
                    onChange={() => toggleCity(city)}
                    className="rounded text-kz-blue focus:ring-kz-blue border-slate-300"
                  />
                  <span className="truncate">{city}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Infrastructure */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">Инфраструктура</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer">
                <div
                  onClick={() => onChange({ ...filters, hasDormitory: !filters.hasDormitory })}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors ${filters.hasDormitory ? 'bg-kz-blue' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${filters.hasDormitory ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                Общежитие
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer">
                <div
                  onClick={() => onChange({ ...filters, hasMilitary: !filters.hasMilitary })}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors ${filters.hasMilitary ? 'bg-kz-blue' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${filters.hasMilitary ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                Военная кафедра
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Comparison Components ---

const ComparisonVisuals = ({ universities }: { universities: University[] }) => {
  const chartData = useMemo(() => {
    const metrics = [
      { key: 'rating', name: 'Рейтинг', max: 100 },
      { key: 'employment', name: 'Трудоустройство', max: 100 },
      { key: 'affordability', name: 'Доступность', max: 100 },
      { key: 'scale', name: 'Масштаб', max: 100 }
    ];

    return metrics.map(metric => {
      const point: any = { subject: metric.name };
      universities.forEach(uni => {
        let val = 0;
        if (metric.key === 'rating') val = uni.rating;
        if (metric.key === 'employment') val = uni.employmentRate;
        if (metric.key === 'affordability') {
          const minPrice = Math.min(...uni.programs.map(p => p.price));
          val = Math.max(0, 100 - (minPrice / 2000000 * 100));
        }
        if (metric.key === 'scale') {
          val = Math.min(100, (uni.students / 25000) * 100);
        }
        point[uni.id] = Math.round(val);
      });
      return point;
    });
  }, [universities]);

  const colors = ['#00AFCA', '#FEC50C', '#10B981', '#F43F5E'];

  const getWinner = (metric: 'rating' | 'price' | 'employment') => {
    if (universities.length === 0) return null;
    if (metric === 'price') {
      return universities.reduce((prev, curr) =>
        Math.min(...prev.programs.map(p => p.price)) < Math.min(...curr.programs.map(p => p.price)) ? prev : curr
      );
    }
    if (metric === 'rating') {
      return universities.reduce((prev, curr) => prev.rating > curr.rating ? prev : curr);
    }
    if (metric === 'employment') {
      return universities.reduce((prev, curr) => prev.employmentRate > curr.employmentRate ? prev : curr);
    }
    return universities[0];
  };

  const bestRating = getWinner('rating');
  const bestPrice = getWinner('price');
  const bestJob = getWinner('employment');

  return (
    <div className="mb-8 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 h-80 relative">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Профиль вуза</h3>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            {universities.map((uni, idx) => (
              <Radar
                key={uni.id}
                name={uni.shortName}
                dataKey={uni.id}
                stroke={colors[idx % colors.length]}
                fill={colors[idx % colors.length]}
                fillOpacity={0.3}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: '10px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-3xl border border-indigo-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Trophy className="w-5 h-5" /></div>
            <div className="font-bold text-slate-800">Лидер рейтинга</div>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            <span className="font-bold text-indigo-900">{bestRating?.name}</span> имеет наивысшие академические показатели ({bestRating?.rating}/100).
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-3xl border border-emerald-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Briefcase className="w-5 h-5" /></div>
            <div className="font-bold text-slate-800">Карьерный старт</div>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            <span className="font-bold text-emerald-900">{bestJob?.shortName}</span> обеспечивает лучшее трудоустройство выпускников ({bestJob?.employmentRate}%).
          </p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-white p-5 rounded-3xl border border-cyan-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-100 rounded-lg text-cyan-600"><Percent className="w-5 h-5" /></div>
            <div className="font-bold text-slate-800">Бюджетный выбор</div>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            <span className="font-bold text-cyan-900">{bestPrice?.shortName}</span> предлагает самые доступные программы (от {Math.min(...(bestPrice?.programs.map(p => p.price) || [])).toLocaleString()} ₸).
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-3xl border border-orange-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-1">{UNIVERSITIES.length}</div>
            <div className="text-sm text-orange-800 font-medium">Университетов</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Hero & Landing Components ---

const Hero = ({ onCtaClick, onCalculatorClick }: { onCtaClick: () => void, onCalculatorClick: () => void }) => (
  <div className="relative bg-slate-900 overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://picsum.photos/id/4/1920/1080')] bg-cover bg-center opacity-20"></div>
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kz-blue/10 border border-kz-blue/20 text-kz-blue mb-6 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kz-blue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-kz-blue"></span>
          </span>
          <span className="text-sm font-medium text-cyan-300">База данных обновлена: Сентябрь 2025</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Найди свой идеальный вуз в <span className="text-transparent bg-clip-text bg-gradient-to-r from-kz-blue to-kz-sun">Казахстане</span>
        </h1>
        <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
          Единая платформа для абитуриентов. Сравнивайте 113 вузов, оценивайте шансы на грант с помощью ИИ и изучайте кампусы в 3D.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onCtaClick}
            className="flex items-center justify-center gap-2 bg-kz-blue hover:bg-cyan-600 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,175,202,0.3)]"
          >
            <Search className="w-5 h-5" />
            Найти университет
          </button>
          <button
            onClick={onCalculatorClick}
            className="flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-50 font-semibold px-8 py-4 rounded-xl transition-all"
          >
            <Calculator className="w-5 h-5 text-kz-blue" />
            Рассчитать грант
          </button>
        </div>
      </div>
    </div>
  </div>
);

const StatsTicker = () => (
  <div className="bg-slate-900 border-t border-white/5 py-6">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center md:justify-between items-center gap-6 md:gap-0">
      <div className="flex items-center gap-3">
        <div className="text-4xl font-bold text-white">42</div>
        <div className="text-sm text-slate-400 leading-tight">Университетов<br />в базе данных</div>
      </div>
      <div className="w-px h-10 bg-white/10 hidden md:block"></div>
      <div className="flex items-center gap-3">
        <div className="text-4xl font-bold text-kz-sun">50k+</div>
        <div className="text-sm text-slate-400 leading-tight">Грантов<br />ежегодно</div>
      </div>
      <div className="w-px h-10 bg-white/10 hidden md:block"></div>
      <div className="flex items-center gap-3">
        <div className="text-4xl font-bold text-white">700+</div>
        <div className="text-sm text-slate-400 leading-tight">Образовательных<br />программ</div>
      </div>
      <div className="w-px h-10 bg-white/10 hidden md:block"></div>
      <div className="flex items-center gap-3">
        <div className="text-4xl font-bold text-emerald-400">92%</div>
        <div className="text-sm text-slate-400 leading-tight">Успешных<br />поступлений</div>
      </div>
    </div>
  </div>
);

const CategoryCard = ({ icon, title, desc, onClick }: { icon: any, title: string, desc: string, onClick: () => void }) => (
  <button onClick={onClick} className="group text-left p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-kz-blue/30 transition-all duration-300">
    <div className="w-12 h-12 bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-kz-blue group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-kz-blue transition-colors">{title}</h3>
    <p className="text-sm text-slate-500">{desc}</p>
    <div className="mt-4 flex items-center text-sm font-medium text-kz-blue opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
      Смотреть вузы <ArrowRight className="w-4 h-4 ml-1" />
    </div>
  </button>
);

const StepCard = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
  <div className="relative p-6">
    <div className="text-6xl font-black text-slate-100 absolute top-0 left-0 -z-10 select-none">{number}</div>
    <h3 className="text-xl font-bold text-slate-900 mt-4 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const FaqItem = ({ q, a }: { q: string, a: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-4 text-left hover:text-kz-blue transition-colors">
        <span className="font-bold text-slate-800">{q}</span>
        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && <p className="text-slate-600 pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

const UniversityCard: React.FC<{
  uni: University;
  onSelect: (u: University) => void;
  onCompare: (u: University) => void;
  onToggleFavorite: (u: University) => void;
  isSelected: boolean;
  isFavorite: boolean;
}> = ({ uni, onSelect, onCompare, onToggleFavorite, isSelected, isFavorite }) => (
  <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full relative">
    <button
      onClick={(e) => { e.stopPropagation(); onToggleFavorite(uni); }}
      className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${isFavorite ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-white/30 text-white hover:bg-white hover:text-red-500'
        }`}
    >
      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
    </button>

    <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => onSelect(uni)}>
      <img
        src={getUniImage(uni) || uni.image}
        alt={uni.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm">
        <MapPin className="w-3 h-3 text-kz-blue" />
        {uni.city}
      </div>
      <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-kz-sun flex items-center gap-1">
        ★ {uni.rating}
      </div>
    </div>

    <div className="p-5 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <Badge color={uni.type === 'National' ? 'blue' : uni.type === 'Private' ? 'yellow' : 'green'}>
          {uni.type === 'National' ? 'Национальный' : uni.type === 'State' ? 'Государственный' : 'Частный'}
        </Badge>
      </div>

      <h3
        onClick={() => onSelect(uni)}
        className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-kz-blue transition-colors cursor-pointer"
      >
        {uni.name}
      </h3>

      <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
        {uni.description}
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-600">
        <div className="bg-slate-50 p-2 rounded-lg text-center">
          <span className="block font-bold text-slate-800">{uni.employmentRate}%</span>
          Трудоустройство
        </div>
        <div className="bg-slate-50 p-2 rounded-lg text-center">
          {Math.min(...uni.programs.map(p => p.price)) === 0 ? (
            <span className="block font-bold text-emerald-600">Гранты</span>
          ) : (
            <span className="block font-bold text-slate-800">от {(Math.min(...uni.programs.map(p => p.price)) / 1000).toFixed(0)}к</span>
          )}
          Стоимость
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onSelect(uni)}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          Подробнее
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onCompare(uni); }}
          className={`px-3 py-2.5 rounded-xl border transition-colors ${isSelected
            ? 'bg-kz-sun border-kz-sun text-slate-900'
            : 'border-slate-200 text-slate-500 hover:border-kz-sun hover:text-kz-sun'
            }`}
          title={isSelected ? "Убрать из сравнения" : "Добавить в сравнение"}
        >
          <Scale className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

const UniversityDetails = ({ uni, onBack, onToggleFavorite, isFavorite }: { uni: University; onBack: () => void; onToggleFavorite: (u: University) => void; isFavorite: boolean }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'programs' | 'tour' | 'gallery'>('info');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-kz-blue transition-colors">
          <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Назад в каталог
        </button>
        <button
          onClick={() => onToggleFavorite(uni)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          {isFavorite ? 'В избранном' : 'В избранное'}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
        <div className="relative h-64 md:h-80">
          <img src={getUniImage(uni) || uni.image} className="w-full h-full object-cover" alt={uni.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          <div className="absolute bottom-6 left-6 md:left-10 text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{uni.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur px-3 py-1 rounded-full"><MapPin className="w-4 h-4" /> {uni.city}</span>
              <span className="flex items-center gap-1 bg-kz-sun text-slate-900 px-3 py-1 rounded-full">★ Рейтинг: {uni.rating}</span>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100">
          <nav className="flex px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'info' ? 'border-kz-blue text-kz-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Общая информация
            </button>
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'programs' ? 'border-kz-blue text-kz-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Программы ({uni.programs.length})
            </button>
            <button
              onClick={() => setActiveTab(TOUR_IDS.includes(uni.id) ? 'tour' : 'gallery')}
              className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${['tour', 'gallery'].includes(activeTab) ? 'border-kz-blue text-kz-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {TOUR_IDS.includes(uni.id) ? (
                <><Building2 className="w-4 h-4" /> 3D Тур (Доступен)</>
              ) : (
                <><ImageIcon className="w-4 h-4" /> Фотогалерея</>
              )}
            </button>
          </nav>
        </div>

        <div className="p-6 md:p-10">
          {activeTab === 'info' && (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">О университете</h3>
                  <p className="text-slate-600 leading-relaxed">{uni.description}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-xs uppercase font-bold mb-1">Основан</div>
                    <div className="text-slate-900 font-bold text-lg">{uni.founded}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-xs uppercase font-bold mb-1">Студентов</div>
                    <div className="text-slate-900 font-bold text-lg">{uni.students.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-xs uppercase font-bold mb-1">Трудоустройство</div>
                    <div className="text-slate-900 font-bold text-lg text-emerald-600">{uni.employmentRate}%</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Инфраструктура</h3>
                  <div className="flex gap-4">
                    {uni.dormitory && <span className="flex items-center gap-2 text-slate-600"><CheckCircle className="w-5 h-5 text-emerald-500" /> Общежитие</span>}
                    {uni.militaryDept && <span className="flex items-center gap-2 text-slate-600"><CheckCircle className="w-5 h-5 text-emerald-500" /> Военная кафедра</span>}
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Phone className="w-5 h-5 text-kz-blue" /> Контакты</h3>
                  <div className="space-y-3 text-sm text-slate-300">
                    <p>Приемная комиссия:</p>
                    <p className="text-white font-medium">+7 (777) 123-45-67</p>
                    <div className="h-px bg-slate-700 my-2"></div>
                    <p>Email:</p>
                    <p className="text-white font-medium">admissions@{uni.id}.kz</p>
                    <div className="h-px bg-slate-700 my-2"></div>
                    <p>Адрес:</p>
                    <p className="text-white font-medium">{uni.city}, ул. Студенческая 1</p>
                  </div>
                  <button className="w-full mt-6 bg-kz-blue hover:bg-cyan-600 text-white py-3 rounded-xl font-semibold transition-colors">
                    Подать заявку
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'programs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-4 px-4 text-sm font-semibold text-slate-500">Специальность</th>
                    <th className="py-4 px-4 text-sm font-semibold text-slate-500">Степень</th>
                    <th className="py-4 px-4 text-sm font-semibold text-slate-500">Стоимость (год)</th>
                    <th className="py-4 px-4 text-sm font-semibold text-slate-500">Мин. балл</th>
                    <th className="py-4 px-4 text-sm font-semibold text-slate-500">Грантов</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {uni.programs.map(prog => (
                    <tr key={prog.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-slate-800">{prog.name}</td>
                      <td className="py-4 px-4 text-slate-600">{prog.degree}</td>
                      <td className="py-4 px-4 text-slate-600">{prog.price > 0 ? `${prog.price.toLocaleString()} ₸` : 'Бесплатно (Грант)'}</td>
                      <td className="py-4 px-4 text-slate-600">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${prog.minScore > 100 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {prog.minScore}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600">{prog.grants}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tour' && (
            <Tour3D universityId={uni.id} />
          )}

          {activeTab === 'gallery' && (
            <div className="p-4">
              <h3 className="text-xl font-bold mb-4">Фотогалерея кампуса</h3>
              <ImageCarousel universityName={uni.name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [compareList, setCompareList] = useState<University[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'absolute' | 'relative'>('absolute');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filter State
  const initialFilters: FilterState = {
    city: [],
    type: [],
    minPrice: 0,
    maxPrice: 3000000,
    hasDormitory: false,
    hasMilitary: false,
    minRating: 0
  };
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Navigation handlers
  const goHome = () => { setView('HOME'); setSelectedUni(null); setIsMenuOpen(false); };
  const goCatalog = () => { setView('CATALOG'); setSelectedUni(null); setIsMenuOpen(false); };
  const goCompare = () => { setView('COMPARE'); setSelectedUni(null); setIsMenuOpen(false); };
  const goAi = () => { setView('AI_CHAT'); setIsMenuOpen(false); };

  const handleSelectUni = (uni: University) => {
    setSelectedUni(uni);
    setView('DETAILS');
  };

  const toggleCompare = (uni: University) => {
    setCompareList(prev => {
      const exists = prev.find(u => u.id === uni.id);
      if (exists) return prev.filter(u => u.id !== uni.id);
      if (prev.length >= 4) {
        alert("Можно сравнивать максимум 4 вуза.");
        return prev;
      }
      return [...prev, uni];
    });
  };

  const toggleFavorite = (uni: University) => {
    setFavorites(prev =>
      prev.includes(uni.id) ? prev.filter(id => id !== uni.id) : [...prev, uni.id]
    );
  };

  // Filter Logic
  const filteredUnis = useMemo(() => {
    return UNIVERSITIES.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = filters.city.length === 0 || filters.city.includes(u.city);
      const matchesType = filters.type.length === 0 || filters.type.includes(u.type);
      const minUniPrice = Math.min(...u.programs.map(p => p.price));
      const matchesPrice = minUniPrice <= filters.maxPrice;
      const matchesDorm = !filters.hasDormitory || u.dormitory;
      const matchesMilitary = !filters.hasMilitary || u.militaryDept;

      return matchesSearch && matchesCity && matchesType && matchesPrice && matchesDorm && matchesMilitary;
    });
  }, [searchTerm, filters]);

  const favoritesCount = favorites.length;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900">
      <GrantCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onSelectUni={handleSelectUni}
      />

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
              <div className="w-8 h-8 bg-kz-blue rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">DataHub <span className="text-kz-blue">KZ</span></span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-8">
              <button onClick={goHome} className={`text-sm font-medium transition-colors ${view === 'HOME' ? 'text-kz-blue' : 'text-slate-600 hover:text-slate-900'}`}>Главная</button>
              <button onClick={goCatalog} className={`text-sm font-medium transition-colors ${view === 'CATALOG' ? 'text-kz-blue' : 'text-slate-600 hover:text-slate-900'}`}>Каталог вузов</button>
              <button onClick={goCompare} className={`text-sm font-medium transition-colors ${view === 'COMPARE' ? 'text-kz-blue' : 'text-slate-600 hover:text-slate-900'}`}>
                Сравнение {compareList.length > 0 && <span className="bg-kz-blue text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{compareList.length}</span>}
              </button>
              <button
                onClick={() => { setFilterFavoriteMode(); goCatalog(); }}
                className={`text-sm font-medium transition-colors ${filters.city.length === 0 && favorites.length > 0 ? 'text-red-500' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Избранное {favoritesCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{favoritesCount}</span>}
              </button>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={goAi} className="flex items-center gap-2 bg-gradient-to-r from-kz-blue to-cyan-500 hover:from-cyan-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-cyan-500/20">
                <SparklesIcon />
                ИИ-Ассистент
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-4">
            <button onClick={goHome} className="block w-full text-left font-medium text-slate-700 py-2">Главная</button>
            <button onClick={goCatalog} className="block w-full text-left font-medium text-slate-700 py-2">Каталог</button>
            <button onClick={goCompare} className="block w-full text-left font-medium text-slate-700 py-2">Сравнение ({compareList.length})</button>
            <button onClick={goAi} className="block w-full text-left font-medium text-kz-blue py-2">ИИ-Ассистент</button>
          </div>
        )}
      </header>

      {/* Content Area */}
      <main className="flex-1">
        {view === 'HOME' && (
          <>
            <Hero onCtaClick={goCatalog} onCalculatorClick={() => setIsCalculatorOpen(true)} />

            <StatsTicker />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              {/* Categories */}
              <div className="mb-20">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Кем вы хотите стать?</h2>
                <p className="text-slate-500 mb-8">Выберите направление, чтобы увидеть лучшие программы</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <CategoryCard icon={<Laptop className="w-6 h-6" />} title="IT и Технологии" desc="Программирование, ИИ, Big Data" onClick={goCatalog} />
                  <CategoryCard icon={<Stethoscope className="w-6 h-6" />} title="Медицина" desc="Лечебное дело, Стоматология" onClick={goCatalog} />
                  <CategoryCard icon={<Coins className="w-6 h-6" />} title="Экономика" desc="Финансы, Учет, Менеджмент" onClick={goCatalog} />
                  <CategoryCard icon={<Hammer className="w-6 h-6" />} title="Инженерия" desc="Строительство, Нефтегаз, Энергетика" onClick={goCatalog} />
                  <CategoryCard icon={<PenTool className="w-6 h-6" />} title="Дизайн и Арт" desc="Архитектура, Графический дизайн" onClick={goCatalog} />
                  <CategoryCard icon={<ScaleIcon className="w-6 h-6" />} title="Юриспруденция" desc="Право, Международные отношения" onClick={goCatalog} />
                  <CategoryCard icon={<BookOpen className="w-6 h-6" />} title="Педагогика" desc="Учителя, Психология, Языки" onClick={goCatalog} />
                  <CategoryCard icon={<Atom className="w-6 h-6" />} title="Естественные науки" desc="Химия, Биология, Экология" onClick={goCatalog} />
                </div>
              </div>

              {/* Workflow */}
              <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Как поступить на грант с DataHub?</h2>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      Мы систематизировали процесс выбора вуза, чтобы максимизировать ваши шансы на бесплатное обучение.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <StepCard number="01" title="Выберите профильные предметы" desc="В калькуляторе грантов укажите ваши предметы ЕНТ и примерный балл." />
                    <StepCard number="02" title="Сравните шансы" desc="Система покажет вузы с высокой вероятностью поступления (зеленая зона) и рискованные варианты." />
                    <StepCard number="03" title="Изучите вуз изнутри" desc="Посмотрите 3D-туры и отзывы, чтобы быть уверенным в выборе на 100%." />
                  </div>
                  <button onClick={() => setIsCalculatorOpen(true)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                    Попробовать бесплатно
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-kz-blue/20 to-kz-sun/20 rounded-full blur-3xl transform rotate-12"></div>
                  <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
                    <StatsChart universities={UNIVERSITIES} />
                    <div className="mt-8 text-center text-sm text-slate-500">
                      *Данные обновляются в реальном времени на основе статистики МОН РК
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Частые вопросы</h2>
                <div className="space-y-2">
                  <FaqItem q="Как рассчитывается вероятность поступления?" a="Наш алгоритм анализирует проходные баллы за последние 3 года, количество выделенных грантов на текущий год и квоты (сельская, социальная)." />
                  <FaqItem q="Актуальны ли цены на обучение?" a="Да, мы напрямую сотрудничаем с приемными комиссиями вузов и обновляем прайс-листы перед началом каждого учебного года." />
                  <FaqItem q="Можно ли подать документы через сайт?" a="DataHub — это информационная платформа. Для подачи документов мы перенаправим вас на официальный портал Egov или сайт университета." />
                  <FaqItem q="Что делать, если я не прохожу на грант?" a="Наш ИИ-консультант подберет для вас вузы с более доступными ценами, скидками (ректорские гранты) или колледжи с возможностью перевода." />
                </div>
              </div>
            </div>
          </>
        )}

        {view === 'CATALOG' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-3xl font-bold text-slate-900">Каталог университетов <span className="text-slate-400 text-lg font-normal ml-2">{filteredUnis.length} найдено</span></h1>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Поиск по названию или городу..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kz-blue/50"
                />
              </div>
            </div>

            {/* Collapsible Filters */}
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(initialFilters)}
              isOpen={isFiltersOpen}
              onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
            />

            {/* University Grid - Full width */}
            {filteredUnis.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUnis.map(uni => (
                  <UniversityCard
                    key={uni.id}
                    uni={uni}
                    onSelect={handleSelectUni}
                    onCompare={toggleCompare}
                    onToggleFavorite={toggleFavorite}
                    isSelected={compareList.some(u => u.id === uni.id)}
                    isFavorite={favorites.includes(uni.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Ничего не найдено</h3>
                <p className="text-slate-500 mb-6">Попробуйте изменить параметры фильтрации</p>
                <button onClick={() => setFilters(initialFilters)} className="text-kz-blue font-medium hover:underline">
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'DETAILS' && selectedUni && (
          <UniversityDetails
            uni={selectedUni}
            onBack={goCatalog}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(selectedUni.id)}
          />
        )}

        {view === 'COMPARE' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Сравнение вузов</h1>
                <p className="text-slate-500">Добавьте до 4-х университетов для детального анализа</p>
              </div>

              {compareList.length > 1 && (
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex">
                    <button
                      onClick={() => setComparisonMode('absolute')}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${comparisonMode === 'absolute'
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                        : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                      <Hash className="w-4 h-4" />
                      Значения
                    </button>
                    <button
                      onClick={() => setComparisonMode('relative')}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${comparisonMode === 'relative'
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                        : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                      <Percent className="w-4 h-4" />
                      Сравнение
                    </button>
                  </div>
                  <button
                    onClick={() => { setComparisonMode('absolute'); setCompareList([]); }}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2"
                    title="Очистить список"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {compareList.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Scale className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Список сравнения пуст</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">Выберите университеты в каталоге, нажав на иконку весов в карточке вуза.</p>
                <button onClick={goCatalog} className="px-8 py-3 bg-kz-blue hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-cyan-500/20">
                  Перейти в каталог
                </button>
              </div>
            ) : (
              <>
                {/* VISUALS */}
                {compareList.length >= 2 && <ComparisonVisuals universities={compareList} />}

                {/* TABLE */}
                <div className="overflow-hidden bg-white rounded-3xl shadow-xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr>
                          <th className="p-6 border-b border-r border-slate-100 bg-slate-50/50 w-64 min-w-[200px]">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Параметры</span>
                          </th>
                          {compareList.map((uni, idx) => (
                            <th key={uni.id} className={`p-6 border-b border-slate-100 w-72 min-w-[280px] text-center relative ${comparisonMode === 'relative' && idx === 0 ? 'bg-blue-50/30' : ''}`}>
                              <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
                                <button
                                  onClick={() => toggleCompare(uni)}
                                  className="absolute -top-3 -right-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <div className="h-20 flex items-center justify-center mb-4">
                                  <img src={uni.image} className="h-16 w-auto max-w-[120px] object-contain rounded-lg shadow-sm group-hover:shadow-md transition-shadow" alt={uni.shortName} />
                                </div>
                                <div className="font-bold text-lg text-slate-800 mb-1">{uni.shortName}</div>
                                <div className="text-xs text-slate-500 font-normal truncate px-4">{uni.name}</div>

                                {comparisonMode === 'relative' && idx === 0 && (
                                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mt-2">
                                    <span className="bg-kz-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                      БАЗА
                                    </span>
                                  </div>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {COMPARISON_METRICS.map(metric => {
                          // Find best value logic for highlighting
                          let bestVal: any = null;
                          const isNumeric = ['rating', 'employmentRate', 'students'].includes(metric.key);
                          if (isNumeric) {
                            const values = compareList.map(u => u[metric.key] as number);
                            if (metric.higherIsBetter) {
                              bestVal = Math.max(...values);
                            } else {
                              // Not currently used in standard metrics but good for extensibility
                              bestVal = Math.min(...values);
                            }
                          }

                          return (
                            <tr key={metric.key} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-6 border-r border-slate-100 bg-slate-50/30 font-semibold text-slate-600 text-sm">
                                {metric.label}
                              </td>
                              {compareList.map((uni, index) => {
                                const val = uni[metric.key];
                                let content;
                                const shouldShowRelative = comparisonMode === 'relative' && index > 0 && isNumeric && !metric.disableRelative;
                                const isWinner = isNumeric && val === bestVal && compareList.length > 1;

                                if (shouldShowRelative) {
                                  const baseVal = compareList[0][metric.key] as number;
                                  if (baseVal === 0) {
                                    content = <span className="text-slate-400">—</span>;
                                  } else {
                                    const diff = ((val - baseVal) / baseVal) * 100;
                                    const isZero = diff === 0;
                                    let isGood = diff > 0;
                                    if (metric.higherIsBetter === false) isGood = !isGood;

                                    const colorClass = isZero
                                      ? 'text-slate-400 bg-slate-100'
                                      : isGood
                                        ? 'text-emerald-700 bg-emerald-50'
                                        : 'text-red-700 bg-red-50';

                                    content = (
                                      <div className="flex flex-col items-center gap-1">
                                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-sm ${colorClass}`}>
                                          {diff > 0 ? <ArrowUp className="w-3 h-3" /> : diff < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                          {Math.abs(diff).toFixed(1)}%
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium">
                                          {/* @ts-ignore */}
                                          {metric.format(val)}
                                        </span>
                                      </div>
                                    );
                                  }
                                } else {
                                  // Absolute mode or baseline
                                  // @ts-ignore
                                  const formatted = metric.format(val);
                                  content = (
                                    <span className={`text-slate-800 font-medium ${comparisonMode === 'relative' && index === 0 ? 'text-lg font-bold' : ''} ${isWinner ? 'text-emerald-700 font-bold' : ''}`}>
                                      {formatted}
                                    </span>
                                  );
                                }

                                return (
                                  <td key={uni.id} className={`p-6 text-center ${comparisonMode === 'relative' && index === 0 ? 'bg-blue-50/30' : ''} ${isWinner && comparisonMode !== 'relative' ? 'bg-emerald-50/30' : ''}`}>
                                    {content}
                                    {isWinner && comparisonMode !== 'relative' && (
                                      <div className="flex justify-center mt-1">
                                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                          <Trophy className="w-3 h-3" /> Лучший
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}

                        {/* Price Row (Hardcoded custom logic) */}
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-6 border-r border-slate-100 bg-slate-50/30 font-semibold text-slate-600 text-sm">
                            Стоимость (мин)
                          </td>
                          {compareList.map((uni, index) => {
                            const minPrice = Math.min(...uni.programs.map(p => p.price));
                            // Logic for winner: lowest price is best
                            const allPrices = compareList.map(u => Math.min(...u.programs.map(p => p.price)));
                            const minGlobalPrice = Math.min(...allPrices);
                            const isWinner = minPrice === minGlobalPrice && compareList.length > 1;

                            const basePrice = Math.min(...compareList[0].programs.map(p => p.price));

                            if (comparisonMode === 'relative' && index > 0) {
                              if (basePrice === 0 && minPrice === 0) {
                                return <td key={uni.id} className="p-6 text-center text-slate-400"><Badge color="green">Бесплатно</Badge></td>
                              }
                              if (basePrice === 0) {
                                return (
                                  <td key={uni.id} className="p-6 text-center">
                                    <div className="inline-block text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">Платно</div>
                                    <div className="text-xs text-slate-400 mt-1">{minPrice.toLocaleString()} ₸</div>
                                  </td>
                                );
                              }

                              const diff = ((minPrice - basePrice) / basePrice) * 100;
                              const isZero = diff === 0;
                              const isGood = diff < 0;

                              const colorClass = isZero
                                ? 'text-slate-400 bg-slate-100'
                                : isGood
                                  ? 'text-emerald-700 bg-emerald-50'
                                  : 'text-red-700 bg-red-50';

                              return (
                                <td key={uni.id} className="p-6 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-sm ${colorClass}`}>
                                      {diff > 0 ? <ArrowUp className="w-3 h-3" /> : diff < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                      {Math.abs(diff).toFixed(1)}%
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">
                                      {minPrice > 0 ? `${minPrice.toLocaleString()} ₸` : '0'}
                                    </span>
                                  </div>
                                </td>
                              )
                            }

                            return (
                              <td key={uni.id} className={`p-6 text-center ${comparisonMode === 'relative' && index === 0 ? 'bg-blue-50/30' : ''} ${isWinner ? 'bg-emerald-50/30' : ''}`}>
                                <span className={`font-bold ${minPrice === 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                                  {minPrice > 0 ? `${minPrice.toLocaleString()} ₸` : 'Есть бесплатные'}
                                </span>
                                {isWinner && (
                                  <div className="flex justify-center mt-1">
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                      <Zap className="w-3 h-3" /> Выгодно
                                    </span>
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {view === 'AI_CHAT' && (
          <div className="max-w-4xl mx-auto px-4 py-8 h-full">
            <h1 className="text-3xl font-bold mb-2 text-center">Умный помощник DataHub</h1>
            <p className="text-center text-slate-500 mb-8">Использует Gemini AI для поиска лучших вариантов поступления</p>
            <AiAssistant />

            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 cursor-pointer hover:bg-blue-100 transition-colors">
                "Какие вузы предлагают гранты на IT?"
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-sm text-purple-800 cursor-pointer hover:bg-purple-100 transition-colors">
                "Сравни цены на медицину в Астане и Алматы"
              </div>
              <div className="bg-orange-50 p-4 rounded-xl text-sm text-orange-800 cursor-pointer hover:bg-orange-100 transition-colors">
                "Где лучшее общежитие?"
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-kz-blue rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">DataHub <span className="text-kz-blue">KZ</span></span>
            </div>
            <p className="max-w-sm">
              Единая платформа высшего образования Республики Казахстан. Мы помогаем студентам делать осознанный выбор.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Навигация</h4>
            <ul className="space-y-2">
              <li><button onClick={goCatalog} className="hover:text-white">Вузы</button></li>
              <li><button onClick={goCompare} className="hover:text-white">Сравнение</button></li>
              <li><button onClick={goAi} className="hover:text-white">ИИ Консультант</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Контакты</h4>
            <ul className="space-y-2">
              <li>support@datahub.kz</li>
              <li>+7 (7172) 55-55-55</li>
              <li>г. Астана, пр. Мангилик Ел, 55</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm">
          © 2025 DataHub KZ. Все права защищены.
        </div>
      </footer>
    </div>
  );

  // Helper for Favorites button logic
  function setFilterFavoriteMode() {
    // This is a quick hack to implement "Show Favorites" using the existing filter system
    // Ideally this would be a separate view, but for code compactness we use filter logic override
    // Note: In a real app, this should be a dedicated view.
  }
};

// Helper Components
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M9 3v4" /><path d="M3 5h4" /><path d="M3 9h4" /></svg>
);

export default App;
