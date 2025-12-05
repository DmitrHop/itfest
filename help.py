import os
import requests
from bs4 import BeautifulSoup

# ------- НАСТРОЙКИ --------------------------

# список страниц, с которых нужно собрать ссылки
SOURCE_URLS = [
    "https://univery.kz/natsionalnye-vuzy.html",
    "https://univery.kz/mezhdunarodnye-vuzy.html",
    "https://univery.kz/vuzy-silovykh-vedomstv.html",
    "https://univery.kz/meditsinskie-vuzy.html",
]

SOURCE_URLS = [
    "https://univery.kz/natsionalnye-vuzy.html",
]

# куда сохранять HTML-файлы
OUTPUT_DIR = "redirect_pages"

# --------------------------------------------


TEMPLATE = """<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Redirect: {query}</title>
  <meta http-equiv="refresh" content="0;url={url}">
  <script>
    window.location.replace("{url}");
  </script>
  <style>
    body {{ font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding: 2rem; }}
    a {{ word-break: break-all; }}
  </style>
</head>
<body>
  <p>Если автоматического перехода не произошло — <a href="{url}">нажмите здесь</a>.</p>
  <p>Ссылка: <strong>{query}</strong></p>
</body>
</html>
"""


def fetch_links(url):
    """Получает ссылки с страницы по заданной структуре."""
    print(f"Парсим: {url}")
    html = requests.get(url).text
    soup = BeautifulSoup(html, "html.parser")
    # print(soup)

    links = []

    # Ищем структуру div.contacts-wrapper → div.contacts-content → li.contact-item → a.auto-link.external-link
    wrapper = soup.find_all("div", class = "contacts-content")
    print(wrapper)
    if not wrapper:
        print("Не найдено contacts-wrapper / contacts-content")
        return []

    for li in wrapper.find("li.contact-item a.auto-link.external-link"):
        print("проходка по li")
        href = li.get("href")
        if href:
            links.append(href)

    print(f"Найдено ссылок: {len(links)}")
    return links


def create_html_file(url, index):
    """Создаёт html файл редиректа."""
    safe_name = f"redirect_{index}.html"
    content = TEMPLATE.format(url=url, query=url)

    with open(os.path.join(OUTPUT_DIR, safe_name), "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Создан файл: {safe_name}")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    all_links = []

    # собираем ссылки с каждой страницы
    for page in SOURCE_URLS:
        all_links.extend(fetch_links(page))

    print(f"\nВсего ссылок собрано: {len(all_links)}")

    # создаём html для каждой
    for i, link in enumerate(all_links, 1):
        create_html_file(link, i)


if __name__ == "__main__":
    main()
