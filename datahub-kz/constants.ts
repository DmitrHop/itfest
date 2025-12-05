
import { University, ComparisonMetric } from './types';

export const UNIVERSITIES: University[] = [
  {
    id: 'nu',
    name: 'Nazarbayev University',
    shortName: 'NU',
    city: 'Astana',
    rating: 98,
    image: 'https://images.unsplash.com/photo-1551135049-8a33b5883817?q=80&w=800&auto=format&fit=crop', // Modern glass architecture
    description: 'Исследовательский университет международного уровня, расположенный в Астане.',
    type: 'International',
    founded: 2010,
    students: 6500,
    employmentRate: 96,
    dormitory: true,
    militaryDept: false,
    coordinates: { lat: 51.09, lng: 71.4 },
    programs: [
      { id: 'cs_nu', name: 'Computer Science', degree: 'Bachelor', price: 0, minScore: 130, grants: 150 },
      { id: 'eng_nu', name: 'Robotics', degree: 'Bachelor', price: 0, minScore: 125, grants: 100 },
    ]
  },
  {
    id: 'kaznu',
    name: 'Al-Farabi Kazakh National University',
    shortName: 'KazNU',
    city: 'Almaty',
    rating: 95,
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop', // Green classic campus
    description: 'Ведущий национальный университет Казахстана, старейший вуз страны.',
    type: 'National',
    founded: 1934,
    students: 25000,
    employmentRate: 88,
    dormitory: true,
    militaryDept: true,
    coordinates: { lat: 43.22, lng: 76.9 },
    programs: [
      { id: 'law_kaznu', name: 'International Law', degree: 'Bachelor', price: 1200000, minScore: 110, grants: 50 },
      { id: 'it_kaznu', name: 'Information Systems', degree: 'Bachelor', price: 1100000, minScore: 105, grants: 200 },
    ]
  },
  {
    id: 'kbtu',
    name: 'Kazakh-British Technical University',
    shortName: 'KBTU',
    city: 'Almaty',
    rating: 92,
    image: 'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?q=80&w=800&auto=format&fit=crop', // Classic architecture / columns
    description: 'Один из лидеров технического образования в Центральной Азии.',
    type: 'State',
    founded: 2001,
    students: 4000,
    employmentRate: 98,
    dormitory: true,
    militaryDept: true,
    coordinates: { lat: 43.25, lng: 76.94 },
    programs: [
      { id: 'it_kbtu', name: 'Information Technology', degree: 'Bachelor', price: 1800000, minScore: 115, grants: 120 },
      { id: 'oil_kbtu', name: 'Petroleum Engineering', degree: 'Bachelor', price: 2000000, minScore: 100, grants: 80 },
    ]
  },
  {
    id: 'iitu',
    name: 'International IT University',
    shortName: 'IITU',
    city: 'Almaty',
    rating: 89,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop', // Modern tech environment
    description: 'Специализированный IT-вуз, готовящий кадры для цифровой экономики.',
    type: 'State',
    founded: 2009,
    students: 5500,
    employmentRate: 94,
    dormitory: true,
    militaryDept: true,
    coordinates: { lat: 43.23, lng: 76.91 },
    programs: [
      { id: 'cs_iitu', name: 'Computer Systems', degree: 'Bachelor', price: 1300000, minScore: 95, grants: 300 },
      { id: 'journ_iitu', name: 'Digital Journalism', degree: 'Bachelor', price: 1000000, minScore: 90, grants: 20 },
    ]
  },
  {
    id: 'sdu',
    name: 'Suleyman Demirel University',
    shortName: 'SDU',
    city: 'Kaskelen',
    rating: 87,
    image: 'https://images.unsplash.com/photo-1504817343863-5092a3238007?q=80&w=800&auto=format&fit=crop', // Students on campus
    description: 'Международный университет с обучением преимущественно на английском языке.',
    type: 'Private',
    founded: 1996,
    students: 7000,
    employmentRate: 85,
    dormitory: true,
    militaryDept: false,
    coordinates: { lat: 43.2, lng: 76.6 },
    programs: [
      { id: 'math_sdu', name: 'Mathematics', degree: 'Bachelor', price: 1500000, minScore: 85, grants: 100 },
      { id: 'ph_sdu', name: 'Philology', degree: 'Bachelor', price: 1200000, minScore: 80, grants: 50 },
    ]
  },
  {
    id: 'narxoz',
    name: 'Narxoz University',
    shortName: 'Narxoz',
    city: 'Almaty',
    rating: 90,
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop', // Business / modern
    description: 'Ведущий экономический университет, кузница кадров для бизнеса и финансов.',
    type: 'Private',
    founded: 1963,
    students: 6000,
    employmentRate: 92,
    dormitory: true,
    militaryDept: true,
    coordinates: { lat: 43.21, lng: 76.86 },
    programs: [
      { id: 'fin_narxoz', name: 'Finance', degree: 'Bachelor', price: 1400000, minScore: 90, grants: 60 },
      { id: 'acc_narxoz', name: 'Accounting', degree: 'Bachelor', price: 1300000, minScore: 85, grants: 40 },
    ]
  }
];

export const COMPARISON_METRICS: ComparisonMetric[] = [
  { label: 'Рейтинг', key: 'rating', format: (v: number) => `${v}/100`, higherIsBetter: true },
  { label: 'Трудоустройство', key: 'employmentRate', format: (v: number) => `${v}%`, higherIsBetter: true },
  { label: 'Студентов', key: 'students', format: (v: number) => v.toLocaleString(), higherIsBetter: true },
  { label: 'Год основания', key: 'founded', format: (v: number) => v.toString(), disableRelative: true },
  { label: 'Общежитие', key: 'dormitory', format: (v: boolean) => v ? 'Есть' : 'Нет', disableRelative: true },
  { label: 'Военная кафедра', key: 'militaryDept', format: (v: boolean) => v ? 'Есть' : 'Нет', disableRelative: true },
];
