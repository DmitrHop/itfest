import requests
from bs4 import BeautifulSoup
import time
import os
import re
import json
import urllib.parse
from urllib3.exceptions import InsecureRequestWarning
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import warnings
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('parser.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Игнорируем предупреждения о небезопасных SSL соединениях
warnings.filterwarnings('ignore', category=InsecureRequestWarning)

# Папка для сохранения результатов
output_dir = "universities_data"
os.makedirs(output_dir, exist_ok=True)

@dataclass
class UniversityData:
    """Структура данных университета."""
    name: str
    domain: str
    url: str
    original_input: str
    location: Dict[str, str]
    programs: Dict[str, List[Dict]]
    about: str
    sections: Dict[str, str]
    contacts: Dict[str, str]
    has_3d_tour: bool
    tour_info: Optional[Dict]
    raw_data: Dict

class UniversityParser:
    def __init__(self):
        self.session = self._create_session()
        self.program_patterns = {
            'бакалавриат': [
                'бакалавр', 'бакалавриат', 'бакалавриата', 'bachelor', 'undergraduate',
                'бакалаврдық', 'бак', 'бакалаврская программа'
            ],
            'магистратура': [
                'магистр', 'магистратура', 'магистратуры', 'master', 'graduate',
                'магистрлік', 'маг', 'магистерская программа'
            ],
            'докторантура': [
                'доктор', 'докторантура', 'докторантуры', 'phd', 'doctoral',
                'докторант', 'докторская программа', 'аспирантура'
            ],
            'ординатура': [
                'ординатура', 'ординатуры', 'internship', 'residency',
                'клиническая ординатура'
            ],
            'подготовительные': [
                'подготовительный', 'подготовка', 'foundation', 'preparatory',
                'довузовская подготовка'
            ]
        }
        
        self.location_keywords = [
            'адрес', 'address', 'местонахождение', 'location', 'контакты',
            'абырар', 'адресі', 'мекенжайы', 'қала', 'город', 'city',
            'улица', 'көше', 'проспект', 'проспекті', 'avenue',
            'дом', 'үй', 'здание', 'ғимарат', 'корпус', 'корпусы'
        ]
        
        self.program_keywords = [
            'образовательные программы', 'программы обучения', 'специальности',
            'направления подготовки', 'факультеты', 'кафедры',
            'білім беру бағдарламалары', 'оқу бағдарламалары',
            'мамандықтар', 'дайындау бағыттары',
            'faculties', 'departments', 'programs', 'degrees'
        ]

    def _create_session(self):
        """Создает сессию с повторными попытками."""
        session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=0.5,
            status_forcelist=[500, 502, 503, 504],
            allowed_methods=['GET', 'POST']
        )
        adapter = HTTPAdapter(max_retries=retry)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        session.verify = False
        return session

    def find_best_domain(self, original_domain: str) -> Optional[str]:
        """Находит рабочий домен, проверяя альтернативы."""
        clean_domain = self._normalize_domain(original_domain)
        
        # Приоритетные домены для проверки
        domains_to_try = []
        
        # Если уже .edu.kz, оставляем как есть
        if clean_domain.endswith('.edu.kz'):
            domains_to_try.append(clean_domain)
        else:
            # Пробуем добавить .edu.kz
            if clean_domain.endswith('.kz'):
                edu_domain = clean_domain[:-3] + '.edu.kz'
                domains_to_try.append(edu_domain)
            
            # Пробуем заменить окончание на .edu.kz
            for ext in ['.com', '.ru', '.org', '.net']:
                if clean_domain.endswith(ext):
                    name_part = clean_domain[:-len(ext)]
                    domains_to_try.append(f"{name_part}.edu.kz")
                    break
            
            # Оригинальный домен как запасной вариант
            domains_to_try.append(clean_domain)
        
        # Проверяем каждый домен
        for domain in domains_to_try:
            for protocol in ['https://', 'http://']:
                for prefix in ['', 'www.']:
                    url = f"{protocol}{prefix}{domain}"
                    try:
                        response = self.session.head(url, timeout=5, allow_redirects=True)
                        if response.status_code < 400:
                            logger.info(f"Найден рабочий домен: {url}")
                            return response.url
                    except:
                        continue
        
        return None

    def _normalize_domain(self, domain: str) -> str:
        """Нормализует домен."""
        domain = domain.strip().lower()
        domain = re.sub(r'^https?://', '', domain)
        domain = re.sub(r'^www\.', '', domain)
        domain = domain.split('/')[0]
        return domain

    def fetch_page(self, url: str) -> Optional[Tuple[str, str]]:
        """Загружает страницу."""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,kk;q=0.6',
        }
        
        try:
            response = self.session.get(url, headers=headers, timeout=15, allow_redirects=True)
            response.encoding = response.apparent_encoding or 'utf-8'
            
            # Пробуем найти русскую версию
            final_url = response.url
            if not any(lang in final_url for lang in ['/ru/', '/kz/', '/en/', '/kk/']):
                base_url = final_url.rstrip('/')
                for lang in ['/ru', '/kz', '/en', '/kk']:
                    try:
                        lang_response = self.session.head(f"{base_url}{lang}", timeout=3)
                        if lang_response.status_code < 400:
                            response = self.session.get(f"{base_url}{lang}", headers=headers, timeout=15)
                            final_url = response.url
                            break
                    except:
                        continue
            
            return response.text, final_url
        except Exception as e:
            logger.error(f"Ошибка загрузки {url}: {e}")
            return None

    def extract_university_name(self, soup: BeautifulSoup, url: str) -> str:
        """Извлекает название университета."""
        # 1. Из тега title
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
            # Очищаем от лишнего
            title = re.sub(r'[-|] Главная$|[-|] Home$|^Главная [-|] |^Home [-|] ', '', title)
            if len(title) > 5:
                return title[:100]
        
        # 2. Из h1
        h1_tags = soup.find_all('h1')
        for h1 in h1_tags:
            if h1.text and len(h1.text.strip()) > 5:
                text = h1.text.strip()
                if any(word in text.lower() for word in ['универ', 'институт', 'академия', 'колледж']):
                    return text[:100]
        
        # 3. Из мета-тегов
        meta_tags = soup.find_all('meta')
        for meta in meta_tags:
            for attr in ['property', 'name']:
                if meta.get(attr) in ['og:site_name', 'application-name']:
                    name = meta.get('content', '').strip()
                    if name:
                        return name[:100]
        
        # 4. Из логотипа
        logos = soup.find_all('img')
        for logo in logos:
            alt = logo.get('alt', '').strip()
            if alt and len(alt) > 10 and any(word in alt.lower() for word in ['лого', 'logo', 'эмблема']):
                return alt[:100]
        
        # 5. Из домена
        domain = urllib.parse.urlparse(url).netloc
        if domain:
            name = re.sub(r'^www\.|\.(edu\.kz|kz|ru|com|org)$', '', domain)
            name = name.replace('.', ' ').title()
            
            # Расшифровка аббревиатур
            abbr_map = {
                'enu': 'Евразийский национальный университет',
                'kaznu': 'Казахский национальный университет',
                'kaznpu': 'Казахский национальный педагогический университет',
                'kbtu': 'Казахско-Британский технический университет',
                'sdu': 'Университет Сулеймана Демиреля',
                'iitu': 'Международный университет информационных технологий',
                'amu': 'Академия МВД РК',
                'aues': 'Академия экономики и статистики',
                'narkhoz': 'Нархоз университет',
                'astanait': 'Астана IT университет',
            }
            
            for abbr, full_name in abbr_map.items():
                if abbr in name.lower():
                    return full_name
            
            return name
        
        return domain if domain else "Неизвестный университет"

    def extract_location(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Извлекает местоположение университета."""
        location = {
            'адрес': 'Не найден',
            'город': 'Не указан',
            'страна': 'Казахстан',
            'координаты': 'Не указаны',
            'телефон': 'Не указан',
            'email': 'Не указан',
            'веб_сайт': 'Не указан'
        }
        
        # Поиск адреса
        address_found = False
        
        # Ищем по специфическим селекторам
        selectors = [
            '[itemprop="address"]',
            '[class*="address"]',
            '[class*="contact"]',
            'address',
            'footer',
            '.contacts',
            '.contact-info',
            '.address-block'
        ]
        
        for selector in selectors:
            elements = soup.select(selector)
            for elem in elements:
                text = elem.get_text(strip=True, separator=' ')
                if text and len(text) > 20:
                    # Проверяем, что это похоже на адрес
                    if any(keyword in text.lower() for keyword in self.location_keywords):
                        location['адрес'] = text[:300]
                        address_found = True
                        
                        # Пытаемся извлечь город
                        cities = ['Астана', 'Алматы', 'Шымкент', 'Караганда', 'Актобе', 
                                 'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей', 'Костанай']
                        for city in cities:
                            if city in text:
                                location['город'] = city
                                break
                        
                        # Извлекаем телефон
                        phone_pattern = r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]'
                        phones = re.findall(phone_pattern, text)
                        if phones:
                            location['телефон'] = phones[0][:50]
                        
                        # Извлекаем email
                        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
                        emails = re.findall(email_pattern, text)
                        if emails:
                            location['email'] = emails[0]
                        
                        break
            if address_found:
                break
        
        # Если не нашли, ищем в тексте страницы
        if not address_found:
            all_text = soup.get_text()
            lines = all_text.split('\n')
            for line in lines:
                line = line.strip()
                if len(line) > 30 and any(keyword in line.lower() for keyword in self.location_keywords[:4]):
                    location['адрес'] = line[:300]
                    break
        
        return location

    def extract_programs_by_level(self, soup: BeautifulSoup) -> Dict[str, List[Dict]]:
        """Извлекает образовательные программы по уровням."""
        programs = {level: [] for level in self.program_patterns.keys()}
        
        # Поиск разделов с программами
        program_sections = []
        
        # 1. Ищем ссылки на страницы с программами
        for link in soup.find_all('a', href=True):
            link_text = link.get_text(strip=True).lower()
            if any(keyword in link_text for keyword in self.program_keywords):
                href = link['href']
                if not href.startswith(('javascript:', 'mailto:', 'tel:')):
                    program_sections.append((link_text, href))
        
        # 2. Ищем блоки с программами на текущей странице
        program_selectors = [
            '.program-list', '.edu-programs', '.specialties',
            '.directions', '.faculties', '[class*="program"]',
            '.education-programs', '.study-programs'
        ]
        
        for selector in program_selectors:
            blocks = soup.select(selector)
            if blocks:
                for block in blocks:
                    program_sections.append(('блок программ', block))
        
        # 3. Обрабатываем найденные программы
        processed_programs = set()
        
        for section_name, section in program_sections:
            if isinstance(section, str):  # Это ссылка
                # Здесь можно загружать страницу с программами
                # Для простоты пропускаем в этой версии
                continue
            else:  # Это блок на странице
                self._extract_programs_from_block(section, programs, processed_programs)
        
        return programs

    def _extract_programs_from_block(self, block, programs: Dict, processed: set):
        """Извлекает программы из блока."""
        # Ищем все элементы, которые могут быть программами
        candidates = []
        
        # Разные типы элементов, содержащих программы
        for tag in block.find_all(['li', 'div', 'tr', 'a']):
            text = tag.get_text(strip=True)
            if not text or len(text) < 10 or text in processed:
                continue
            
            # Проверяем, что это похоже на программу
            if any(indicator in text.lower() for indicator in [
                'программа', 'специальность', 'направление', 'факультет',
                'кафедра', 'бакалавр', 'магистр', 'доктор'
            ]):
                candidates.append(text)
                processed.add(text)
        
        # Классифицируем найденные программы
        for program_text in candidates:
            program_lower = program_text.lower()
            
            # Определяем уровень программы
            program_level = None
            program_data = {
                'название': program_text[:200],
                'код': self._extract_program_code(program_text),
                'описание': '',
                'продолжительность': self._extract_duration(program_text),
                'язык_обучения': self._extract_language(program_text),
                'форма_обучения': self._extract_study_form(program_text)
            }
            
            for level, keywords in self.program_patterns.items():
                if any(keyword in program_lower for keyword in keywords):
                    program_level = level
                    break
            
            if program_level:
                programs[program_level].append(program_data)

    def _extract_program_code(self, text: str) -> str:
        """Извлекает код программы (если есть)."""
        # Ищем паттерны типа "6B01102", "7M01542" и т.д.
        code_pattern = r'\b[0-9][A-Z][0-9]{5}\b'
        match = re.search(code_pattern, text)
        return match.group() if match else ""

    def _extract_duration(self, text: str) -> str:
        """Извлекает продолжительность обучения."""
        duration_pattern = r'(\d+)\s*(год|лет|года|семестр|семестров|курс)'
        match = re.search(duration_pattern, text, re.IGNORECASE)
        return match.group() if match else ""

    def _extract_language(self, text: str) -> str:
        """Извлекает язык обучения."""
        if any(word in text.lower() for word in ['казахск', 'қазақ', 'kz']):
            return 'Казахский'
        elif any(word in text.lower() for word in ['русск', 'ru', 'russian']):
            return 'Русский'
        elif any(word in text.lower() for word in ['англ', 'english', 'en']):
            return 'Английский'
        return 'Не указан'

    def _extract_study_form(self, text: str) -> str:
        """Извлекает форму обучения."""
        if any(word in text.lower() for word in ['очн', 'full-time', 'денн']):
            return 'Очная'
        elif any(word in text.lower() for word in ['заочн', 'part-time', 'сырттай']):
            return 'Заочная'
        elif any(word in text.lower() for word in ['дистанц', 'online', 'қашықтан']):
            return 'Дистанционная'
        return 'Не указана'

    def extract_about_text(self, soup: BeautifulSoup) -> str:
        """Извлекает текст 'О нас'."""
        about_selectors = [
            'main', 'article', '.content', '.main-content',
            '[class*="about"]', '.about-us', '.about-university',
            '.university-about', '.history', '.mission'
        ]
        
        for selector in about_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True, separator=' ')
                if len(text) > 200:
                    # Очищаем текст
                    text = re.sub(r'\s+', ' ', text)
                    text = re.sub(r'[^\w\s.,!?;:-]', ' ', text)
                    return text[:3000]
        
        # Если не нашли, берем первые 1500 символов страницы
        all_text = soup.get_text(strip=True, separator=' ')
        return all_text[:1500] if len(all_text) > 300 else "Не найден"

    def find_3d_tour(self, soup: BeautifulSoup) -> Tuple[bool, Optional[Dict]]:
        """Ищет 3D-тур."""
        tour_keywords = ['3d', 'тур', 'виртуальный', 'virtual', '360', 'панорам', 'tour']
        
        # Проверяем iframe
        for iframe in soup.find_all('iframe'):
            src = iframe.get('src', '')
            if src and any(keyword in src.lower() for keyword in tour_keywords):
                return True, {'type': 'iframe', 'url': src}
        
        # Проверяем ссылки
        for link in soup.find_all('a', href=True):
            href = link.get('href', '').lower()
            text = link.get_text(strip=True).lower()
            if any(keyword in href or keyword in text for keyword in tour_keywords):
                return True, {'type': 'link', 'url': link['href']}
        
        # Проверяем embed/object
        for embed in soup.find_all(['embed', 'object']):
            data = embed.get('data', '')
            if data and any(keyword in data.lower() for keyword in tour_keywords):
                return True, {'type': 'embed', 'url': data}
        
        return False, None

    def parse_university(self, domain_input: str) -> Optional[UniversityData]:
        """Парсит данные университета."""
        logger.info(f"Начинаем парсинг: {domain_input}")
        
        # Находим рабочий домен
        working_url = self.find_best_domain(domain_input)
        if not working_url:
            logger.error(f"Не найден рабочий домен для: {domain_input}")
            return None
        
        # Загружаем страницу
        page_data = self.fetch_page(working_url)
        if not page_data:
            return None
        
        html, final_url = page_data
        soup = BeautifulSoup(html, 'lxml')
        
        # Извлекаем данные
        name = self.extract_university_name(soup, final_url)
        location = self.extract_location(soup)
        programs = self.extract_programs_by_level(soup)
        about = self.extract_about_text(soup)
        has_tour, tour_info = self.find_3d_tour(soup)
        
        # Собираем ссылки на разделы
        sections = self._find_sections(soup, final_url)
        
        # Собираем контакты
        contacts = self._extract_contacts(soup)
        
        # Создаем объект данных
        university_data = UniversityData(
            name=name,
            domain=urllib.parse.urlparse(final_url).netloc,
            url=final_url,
            original_input=domain_input,
            location=location,
            programs=programs,
            about=about,
            sections=sections,
            contacts=contacts,
            has_3d_tour=has_tour,
            tour_info=tour_info,
            raw_data={'html_sample': html[:1000]}
        )
        
        logger.info(f"Успешно спарсено: {name}")
        return university_data

    def _find_sections(self, soup: BeautifulSoup, base_url: str) -> Dict[str, str]:
        """Находит ссылки на ключевые разделы."""
        sections = {}
        section_keywords = {
            'about': ['о нас', 'об университете', 'о вузе', 'about'],
            'programs': ['программы', 'специальности', 'образование', 'programs'],
            'admission': ['поступление', 'абитуриентам', 'прием', 'admission'],
            'contacts': ['контакты', 'адрес', 'contacts'],
            'faculties': ['факультеты', 'кафедры', 'faculties'],
            'science': ['наука', 'исследования', 'science'],
            'international': ['международное', 'international']
        }
        
        for link in soup.find_all('a', href=True):
            link_text = link.get_text(strip=True).lower()
            for section_id, keywords in section_keywords.items():
                if any(keyword in link_text for keyword in keywords):
                    href = link['href']
                    if not href.startswith(('javascript:', 'mailto:', 'tel:')):
                        # Нормализуем URL
                        if href.startswith('/'):
                            base = urllib.parse.urlparse(base_url)
                            href = f"{base.scheme}://{base.netloc}{href}"
                        elif not href.startswith(('http://', 'https://')):
                            href = urllib.parse.urljoin(base_url, href)
                        
                        sections[section_id] = href
                        break
        
        return sections

    def _extract_contacts(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Извлекает контактную информацию."""
        contacts = {
            'телефон': '',
            'email': '',
            'факс': '',
            'приемная': '',
            'ректорат': ''
        }
        
        # Ищем контактные блоки
        contact_selectors = [
            '.contacts', '.contact-info', '.footer',
            '[class*="phone"]', '[class*="email"]',
            '.header-contacts'
        ]
        
        all_contact_text = ""
        for selector in contact_selectors:
            elements = soup.select(selector)
            for elem in elements:
                all_contact_text += " " + elem.get_text()
        
        # Извлекаем телефоны
        phone_pattern = r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]'
        phones = re.findall(phone_pattern, all_contact_text)
        if phones:
            contacts['телефон'] = ', '.join(phones[:3])
        
        # Извлекаем emails
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, all_contact_text)
        if emails:
            contacts['email'] = ', '.join(emails[:3])
        
        return contacts

    def save_to_file(self, data: UniversityData) -> str:
        """Сохраняет данные в файл."""
        # Создаем безопасное имя файла
        safe_name = re.sub(r'[<>:"/\\|?*]', '_', data.name)
        safe_name = safe_name[:50] or data.domain.replace('.', '_')
        
        # JSON файл с полными данными
        json_filename = os.path.join(output_dir, f"{safe_name}.json")
        with open(json_filename, 'w', encoding='utf-8') as f:
            json_data = {
                'name': data.name,
                'domain': data.domain,
                'url': data.url,
                'original_input': data.original_input,
                'location': data.location,
                'programs': data.programs,
                'about': data.about[:1000],  # Обрезаем для JSON
                'sections': data.sections,
                'contacts': data.contacts,
                'has_3d_tour': data.has_3d_tour,
                'tour_info': data.tour_info,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        # TXT файл с читабельной версией
        txt_filename = os.path.join(output_dir, f"{safe_name}.txt")
        with open(txt_filename, 'w', encoding='utf-8') as f:
            self._write_human_readable(f, data)
        
        return txt_filename

    def _write_human_readable(self, file_obj, data: UniversityData):
        """Записывает данные в читаемом формате."""
        file_obj.write("=" * 70 + "\n")
        file_obj.write(f"УНИВЕРСИТЕТ: {data.name}\n")
        file_obj.write(f"ДОМЕН: {data.domain}\n")
        file_obj.write(f"URL: {data.url}\n")
        file_obj.write(f"ОРИГИНАЛЬНЫЙ ВВОД: {data.original_input}\n")
        file_obj.write("=" * 70 + "\n\n")
        
        # Местоположение
        file_obj.write("МЕСТОПОЛОЖЕНИЕ:\n")
        file_obj.write("-" * 30 + "\n")
        for key, value in data.location.items():
            if value and value != 'Не найден' and value != 'Не указан':
                file_obj.write(f"  {key.title()}: {value}\n")
        file_obj.write("\n")
        
        # Контакты
        file_obj.write("КОНТАКТЫ:\n")
        file_obj.write("-" * 30 + "\n")
        for key, value in data.contacts.items():
            if value:
                file_obj.write(f"  {key.title()}: {value}\n")
        file_obj.write("\n")
        
        # Образовательные программы
        file_obj.write("ОБРАЗОВАТЕЛЬНЫЕ ПРОГРАММЫ:\n")
        file_obj.write("=" * 50 + "\n")
        
        for level, programs in data.programs.items():
            if programs:
                file_obj.write(f"\n{level.upper()}:\n")
                file_obj.write("-" * 30 + "\n")
                for i, program in enumerate(programs, 1):
                    file_obj.write(f"\n  Программа {i}:\n")
                    file_obj.write(f"    Название: {program.get('название', 'Нет данных')}\n")
                    
                    if program.get('код'):
                        file_obj.write(f"    Код: {program['код']}\n")
                    
                    if program.get('продолжительность'):
                        file_obj.write(f"    Продолжительность: {program['продолжительность']}\n")
                    
                    if program.get('язык_обучения'):
                        file_obj.write(f"    Язык обучения: {program['язык_обучения']}\n")
                    
                    if program.get('форма_обучения'):
                        file_obj.write(f"    Форма обучения: {program['форма_обучения']}\n")
                
                if len(programs) == 0:
                    file_obj.write("    Программы не найдены\n")
        
        # 3D тур
        file_obj.write("\n3D ТУР:\n")
        file_obj.write("-" * 30 + "\n")
        if data.has_3d_tour and data.tour_info:
            file_obj.write(f"  Найден: Да\n")
            file_obj.write(f"  Тип: {data.tour_info.get('type', 'неизвестно')}\n")
            file_obj.write(f"  Ссылка: {data.tour_info.get('url', 'нет')}\n")
        else:
            file_obj.write("  Найден: Нет\n")
        
        # Описание
        file_obj.write("\nОПИСАНИЕ УНИВЕРСИТЕТА:\n")
        file_obj.write("=" * 50 + "\n")
        file_obj.write(data.about)
        file_obj.write("\n\n")
        
        # Ссылки на разделы
        if data.sections:
            file_obj.write("ССЫЛКИ НА РАЗДЕЛЫ:\n")
            file_obj.write("-" * 30 + "\n")
            for section, url in data.sections.items():
                file_obj.write(f"  {section}: {url}\n")
        
        file_obj.write("\n" + "=" * 70)
        file_obj.write(f"\nДата парсинга: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")