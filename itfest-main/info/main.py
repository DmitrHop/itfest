#!/usr/bin/env python3
"""
Главный скрипт для запуска парсера университетов
"""

import sys
import os
import time
from typing import List
from datetime import datetime

def load_domains_from_file(filename: str) -> List[str]:
    """Загружает список доменов из файла."""
    domains = []
    
    if not os.path.exists(filename):
        print(f"Файл {filename} не найден!")
        return domains
    
    with open(filename, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            
            # Пропускаем пустые строки и комментарии
            if not line or line.startswith('#'):
                continue
            
            # Пропускаем email-адреса
            if '@' in line:
                print(f"Строка {line_num}: Пропущен email: {line}")
                continue
            
            # Пропускаем почтовые сервисы
            if any(service in line.lower() for service in [
                'mail.ru', 'gmail.com', 'yandex.ru', 'bk.ru',
                'inbox.ru', 'list.ru', 'rambler.ru', 'hotmail.com',
                'outlook.com', 'yahoo.com'
            ]):
                print(f"Строка {line_num}: Пропущен почтовый сервис: {line}")
                continue
            
            domains.append(line)
    
    return domains

def print_statistics(domains: List[str], results: List):
    """Печатает статистику парсинга."""
    successful = [r for r in results if r is not None]
    failed_count = len(domains) - len(successful)
    
    print("\n" + "=" * 70)
    print("СТАТИСТИКА ПАРСИНГА:")
    print("=" * 70)
    print(f"Всего доменов в списке: {len(domains)}")
    print(f"Успешно обработано: {len(successful)}")
    print(f"Не удалось обработать: {failed_count}")
    
    if successful:
        print(f"\nУспешно обработанные университеты:")
        for result in successful:
            if hasattr(result, 'name'):
                print(f"  ✓ {result.name}")
    
    # Сохраняем сводный отчет
    save_summary_report(domains, results)

def save_summary_report(domains: List[str], results: List):
    """Сохраняет сводный отчет."""
    summary_file = os.path.join("universities_data", "summary_report.md")
    
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write("# Сводный отчет по парсингу университетов\n\n")
        f.write(f"**Дата генерации:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("## Общая статистика\n")
        f.write(f"- Всего доменов в списке: {len(domains)}\n")
        
        successful = [r for r in results if r is not None]
        failed = len(domains) - len(successful)
        
        f.write(f"- Успешно обработано: {len(successful)}\n")
        f.write(f"- Не удалось обработать: {failed}\n\n")
        
        # Статистика по программам
        if successful:
            f.write("## Статистика по программам\n")
            
            program_stats = {}
            for result in successful:
                if hasattr(result, 'programs'):
                    for level, programs in result.programs.items():
                        if level not in program_stats:
                            program_stats[level] = 0
                        program_stats[level] += len(programs)
            
            for level, count in program_stats.items():
                f.write(f"- {level.title()}: {count} программ\n")
            
            f.write("\n")
        
        # Список университетов
        f.write("## Список университетов\n\n")
        
        f.write("### Успешно обработаны:\n")
        for i, result in enumerate(successful, 1):
            if hasattr(result, 'name'):
                f.write(f"{i}. **{result.name}**  \n")
                f.write(f"   Домен: {result.domain}  \n")
                f.write(f"   URL: {result.url}  \n")
                
                # Информация о программах
                if hasattr(result, 'programs'):
                    total_programs = sum(len(progs) for progs in result.programs.values())
                    f.write(f"   Программ найдено: {total_programs}  \n")
                
                # 3D тур
                if hasattr(result, 'has_3d_tour') and result.has_3d_tour:
                    f.write(f"   🎮 Есть 3D тур  \n")
                
                f.write("\n")
        
        # Необработанные домены
        if failed > 0:
            f.write("### Не удалось обработать:\n")
            for i, domain in enumerate(domains, 1):
                if i > len(results) or results[i-1] is None:
                    f.write(f"- {domain}\n")
        
        f.write("\n---\n")
        f.write("*Отчет сгенерирован автоматически*")

def main():
    """Основная функция."""
    print("\n" + "=" * 70)
    print("ПАРСЕР УНИВЕРСИТЕТОВ КАЗАХСТАНА")
    print("Версия 2.0 - с структурированными программами")
    print("=" * 70)
    
    # Проверяем файл со списком доменов
    domains_file = "kaz_universitets.txt"
    
    if not os.path.exists(domains_file):
        print(f"Файл {domains_file} не найден!")
        print("Создайте файл со списком доменов университетов.")
        print("Каждый домен должен быть на отдельной строке.")
        return
    
    # Загружаем домены
    print(f"\nЗагрузка доменов из {domains_file}...")
    domains = load_domains_from_file(domains_file)
    
    if not domains:
        print("Не найдено доменов для обработки!")
        return
    
    print(f"Загружено {len(domains)} доменов")
    
    # Создаем парсер
    try:
        from university_parser import UniversityParser
        parser = UniversityParser()
    except ImportError as e:
        print(f"Ошибка импорта: {e}")
        print("Убедитесь, что файл university_parser.py находится в той же папке")
        return
    
    # Парсим каждый университет
    print(f"\nНачинаем парсинг {len(domains)} университетов...")
    print("=" * 70)
    
    results = []
    start_time = time.time()
    
    for i, domain in enumerate(domains, 1):
        print(f"\n[{i}/{len(domains)}] Обработка: {domain}")
        
        # Задержка для избежания блокировки
        if i > 1:
            time.sleep(2)
        
        try:
            # Парсим университет
            university_data = parser.parse_university(domain)
            
            if university_data:
                # Сохраняем в файл
                filename = parser.save_to_file(university_data)
                print(f"  ✓ Сохранено: {os.path.basename(filename)}")
                
                # Выводим краткую информацию
                print(f"  Название: {university_data.name}")
                
                # Показываем количество найденных программ
                total_programs = sum(len(progs) for progs in university_data.programs.values())
                if total_programs > 0:
                    print(f"  Найдено программ: {total_programs}")
                    for level, programs in university_data.programs.items():
                        if programs:
                            print(f"    {level}: {len(programs)}")
                
                if university_data.has_3d_tour:
                    print(f"  🎮 Обнаружен 3D тур")
                
                results.append(university_data)
            else:
                print(f"  ✗ Не удалось обработать")
                results.append(None)
                
        except KeyboardInterrupt:
            print("\n\nПарсинг прерван пользователем.")
            break
        except Exception as e:
            print(f"  ✗ Ошибка: {type(e).__name__}")
            results.append(None)
    
    # Закрываем сессию
    if hasattr(parser, 'session'):
        parser.session.close()
    
    # Выводим статистику
    elapsed_time = time.time() - start_time
    print_statistics(domains, results)
    
    print(f"\nВремя выполнения: {elapsed_time:.1f} секунд")
    print(f"Среднее время на университет: {elapsed_time/max(1, len(domains)):.1f} секунд")
    # print(f"\nДанные сохранены в папке: {parser.output_dir}")
    print("=" * 70)

if __name__ == "__main__":
    # Проверяем необходимые библиотеки
    try:
        import requests
        import bs4
    except ImportError:
        print("Необходимо установить библиотеки:")
        print("pip install requests beautifulsoup4")
        sys.exit(1)
    
    main()