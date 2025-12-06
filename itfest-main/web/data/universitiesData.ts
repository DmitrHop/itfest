// Real university data from universities_frontend.json
// 26 universities with ENT score requirements

export interface UniversityData {
    id: number;
    name: string;
    city: string;
    type: string;
    category: string;
    direction: string;
    programs: string;
    education_levels: string;
    ent_min_score: number;
    ent_max_score: number;
    profile_subjects: string;
    email: string;
    phone: string;
    address: string;
}

export interface FilterOptions {
    categories: string[];
    cities: string[];
    ent_score_range: { min: number; max: number };
}

// Categories for filtering
export const CATEGORIES = [
    "Все категории",
    "Многопрофильный",
    "Инженерия и техника",
    "Медицина",
    "IT и технологии",
    "Бизнес и экономика",
    "Искусство",
    "Педагогика"
];

// Cities for filtering
export const CITIES = [
    "Все города",
    "Алматы",
    "Астана",
    "Караганда",
    "Семей",
    "Уральск",
    "Актобе",
    "Кокшетау",
    "Каскелен",
    "Шымкент",
    "Павлодар"
];

// Real university data
export const UNIVERSITIES_DATA: UniversityData[] = [
    {
        id: 1,
        name: "Западно-Казахстанский медицинский университет им. Марата Оспанова",
        city: "Актобе",
        type: "Государственный (НАО)",
        category: "Медицина",
        direction: "Медицина",
        programs: "B084-B089 (медицина)",
        education_levels: "Бакалавриат Магистратура Резидентура Докторантура",
        ent_min_score: 70,
        ent_max_score: 70,
        profile_subjects: "Биология + Химия",
        email: "info@zkmu.kz",
        phone: "+7 (7132) 56-00-08",
        address: "ул. Маресьева 68"
    },
    {
        id: 2,
        name: "Кокшетауский университет имени Шокана Уалиханова",
        city: "Кокшетау",
        type: "Государственный (НАО)",
        category: "Многопрофильный",
        direction: "Многопрофильный",
        programs: "80+ программ бакалавриата",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 50,
        ent_max_score: 70,
        profile_subjects: "Разные (в т.ч. Биология+Химия Математика+Физика)",
        email: "mail@kgu.kz",
        phone: "+7 (7162) 72-11-12",
        address: "ул. Абая 76"
    },
    {
        id: 3,
        name: "Университет имени Шакарима",
        city: "Семей",
        type: "Государственный (НАО)",
        category: "Инженерия и техника",
        direction: "Многопрофильный",
        programs: "80+ программ",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 50,
        ent_max_score: 75,
        profile_subjects: "Разные",
        email: "goszakup@shakarim.kz",
        phone: "+7 (222) 30-42-81",
        address: "ул. Глинки 20А"
    },
    {
        id: 4,
        name: "Медицинский университет Семей",
        city: "Семей",
        type: "Государственный (НАО)",
        category: "Медицина",
        direction: "Медицина",
        programs: "B084-B089 (медицина)",
        education_levels: "Бакалавриат Интернатура Резидентура Магистратура Докторантура",
        ent_min_score: 70,
        ent_max_score: 70,
        profile_subjects: "Биология + Химия",
        email: "smu@smu.edu.kz",
        phone: "+7 (7222) 52-22-51",
        address: "ул. Абая Кунанбаева 103"
    },
    {
        id: 5,
        name: "МУИТ (International IT University)",
        city: "Алматы",
        type: "Государственный (НАО)",
        category: "IT и технологии",
        direction: "IT",
        programs: "Компьютерные науки, Кибербезопасность, Data Science",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 50,
        ent_max_score: 75,
        profile_subjects: "Математика + Информатика",
        email: "admission@iitu.edu.kz",
        phone: "+7 (727) 330-85-00",
        address: "ул. Манаса 34/1"
    },
    {
        id: 6,
        name: "Казахский национальный университет им. аль-Фараби (КазНУ)",
        city: "Алматы",
        type: "Национальный",
        category: "Многопрофильный",
        direction: "Многопрофильный",
        programs: "200+ программ",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 65,
        ent_max_score: 100,
        profile_subjects: "Разные",
        email: "info@kaznu.kz",
        phone: "+7 (727) 377-33-30",
        address: "пр. аль-Фараби 71"
    },
    {
        id: 7,
        name: "Казахстанско-Британский технический университет (КБТУ)",
        city: "Алматы",
        type: "Частный",
        category: "IT и технологии",
        direction: "Технический",
        programs: "IT, Нефтегазовое дело, Бизнес",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 70,
        ent_max_score: 110,
        profile_subjects: "Математика + Физика/Информатика",
        email: "admission@kbtu.kz",
        phone: "+7 (727) 272-65-74",
        address: "ул. Толе би 59"
    },
    {
        id: 8,
        name: "Nazarbayev University (NU)",
        city: "Астана",
        type: "Автономный",
        category: "Многопрофильный",
        direction: "Исследовательский",
        programs: "Инженерия, Медицина, Бизнес, Науки",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 100,
        ent_max_score: 140,
        profile_subjects: "Разные + IELTS",
        email: "admissions@nu.edu.kz",
        phone: "+7 (7172) 70-66-88",
        address: "ул. Кабанбай батыра 53"
    },
    {
        id: 9,
        name: "Евразийский национальный университет им. Л.Н. Гумилёва (ЕНУ)",
        city: "Астана",
        type: "Национальный",
        category: "Многопрофильный",
        direction: "Многопрофильный",
        programs: "150+ программ",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 60,
        ent_max_score: 90,
        profile_subjects: "Разные",
        email: "rector@enu.kz",
        phone: "+7 (7172) 70-95-00",
        address: "ул. Сатпаева 2"
    },
    {
        id: 10,
        name: "Satbayev University (КазНИТУ)",
        city: "Алматы",
        type: "Национальный",
        category: "Инженерия и техника",
        direction: "Технический",
        programs: "Инженерия, IT, Геология, Архитектура",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 60,
        ent_max_score: 85,
        profile_subjects: "Математика + Физика",
        email: "info@satbayev.university",
        phone: "+7 (727) 292-63-00",
        address: "ул. Сатпаева 22"
    },
    {
        id: 11,
        name: "Южно-Казахстанский университет им. М. Ауэзова",
        city: "Шымкент",
        type: "Государственный",
        category: "Многопрофильный",
        direction: "Многопрофильный",
        programs: "100+ программ",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 50,
        ent_max_score: 70,
        profile_subjects: "Разные",
        email: "info@auezov.edu.kz",
        phone: "+7 (7252) 21-01-00",
        address: "пр. Тауке хана 5"
    },
    {
        id: 12,
        name: "Карагандинский университет Букетова",
        city: "Караганда",
        type: "Государственный",
        category: "Многопрофильный",
        direction: "Многопрофильный",
        programs: "100+ программ",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 50,
        ent_max_score: 75,
        profile_subjects: "Разные",
        email: "info@ksu.kz",
        phone: "+7 (7212) 35-63-98",
        address: "ул. Университетская 28"
    },
    {
        id: 13,
        name: "Алматинский технологический университет (АТУ)",
        city: "Алматы",
        type: "Государственный",
        category: "Инженерия и техника",
        direction: "Технологический",
        programs: "Пищевая промышленность, IT, Инженерия",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 50,
        ent_max_score: 70,
        profile_subjects: "Математика + Физика/Химия",
        email: "info@atu.edu.kz",
        phone: "+7 (727) 293-52-70",
        address: "ул. Толе би 100"
    },
    {
        id: 14,
        name: "KIMEP University",
        city: "Алматы",
        type: "Частный",
        category: "Бизнес и экономика",
        direction: "Бизнес",
        programs: "MBA, Экономика, Право, Журналистика",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 70,
        ent_max_score: 100,
        profile_subjects: "Математика + Английский",
        email: "admission@kimep.kz",
        phone: "+7 (727) 270-44-40",
        address: "пр. Абая 4"
    },
    {
        id: 15,
        name: "Казахская национальная академия искусств им. Т.К. Жургенова",
        city: "Алматы",
        type: "Национальный",
        category: "Искусство",
        direction: "Искусство",
        programs: "Актёрское мастерство, Режиссура, Дизайн",
        education_levels: "Бакалавриат Магистратура",
        ent_min_score: 50,
        ent_max_score: 65,
        profile_subjects: "Творческий экзамен",
        email: "info@kaznai.kz",
        phone: "+7 (727) 264-77-85",
        address: "ул. Панфилова 127"
    },
    {
        id: 16,
        name: "Казахский национальный педагогический университет им. Абая",
        city: "Алматы",
        type: "Национальный",
        category: "Педагогика",
        direction: "Педагогика",
        programs: "Педагогика, Психология, Филология",
        education_levels: "Бакалавриат Магистратура Докторантура",
        ent_min_score: 50,
        ent_max_score: 75,
        profile_subjects: "Разные",
        email: "info@kaznpu.kz",
        phone: "+7 (727) 291-89-21",
        address: "пр. Достык 13"
    }
];

// Calculate grant chance based on ENT score
export function calculateGrantChance(
    userScore: number,
    minScore: number,
    maxScore: number
): { chance: number; level: 'high' | 'medium' | 'low' } {
    // If user score is below minimum
    if (userScore < minScore) {
        const gap = minScore - userScore;
        const penalty = Math.min(gap * 3, 35); // Up to 35% penalty
        return { chance: Math.max(5, 15 - penalty), level: 'low' };
    }

    // If user score is at or above maximum
    if (userScore >= maxScore) {
        return { chance: 95, level: 'high' };
    }

    // Linear interpolation between min and max
    const range = maxScore - minScore || 1;
    const position = (userScore - minScore) / range;
    const chance = Math.round(25 + position * 65); // 25% to 90%

    if (chance >= 75) return { chance, level: 'high' };
    if (chance >= 45) return { chance, level: 'medium' };
    return { chance, level: 'low' };
}

// Filter universities by category and city
export function filterUniversities(
    universities: UniversityData[],
    category: string,
    city: string
): UniversityData[] {
    return universities.filter(uni => {
        const categoryMatch = category === "Все категории" || uni.category === category;
        const cityMatch = city === "Все города" || uni.city === city;
        return categoryMatch && cityMatch;
    });
}
