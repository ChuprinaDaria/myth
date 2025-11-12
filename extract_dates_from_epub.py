#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для витягування дат та язичницьких свят з EPUB книги
"""

import re
import os
from bs4 import BeautifulSoup
from collections import defaultdict
import json

# Мапінг українських місяців
MONTHS_MAP = {
    'січня': '01', 'січ': '01',
    'лютого': '02', 'лют': '02',
    'березня': '03', 'бер': '03',
    'квітня': '04', 'кві': '04',
    'травня': '05', 'тра': '05',
    'червня': '06', 'чер': '06',
    'липня': '07', 'лип': '07',
    'серпня': '08', 'сер': '08',
    'вересня': '09', 'вер': '09',
    'жовтня': '10', 'жов': '10',
    'листопада': '11', 'лис': '11',
    'грудня': '12', 'гру': '12',
}

# Ключові слова для виявлення язичницьких свят (не християнських)
PAGAN_KEYWORDS = [
    'язичниц', 'слов\'ян', 'древн', 'дохристиян',
    'обряд', 'ритуал', 'гадання', 'ворожіння',
    'Перун', 'Велес', 'Сварог', 'Даждьбог', 'Лада', 'Мокош',
    'Купал', 'Марена', 'Ярило', 'Коляда',
    'весняне', 'літнє', 'осіннє', 'зимове', 'рівнодення', 'сонцестояння'
]

# Виключити християнські свята
CHRISTIAN_KEYWORDS = [
    'апостол', 'святий', 'святої', 'мучени', 'Христ',
    'церков', 'православ', 'хрищен', 'Богородиц'
]


def extract_text_from_html(html_path):
    """Витягує текст з HTML файлу"""
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            return soup.get_text()
    except Exception as e:
        print(f"Помилка читання {html_path}: {e}")
        return ""


def find_dates_in_text(text):
    """Знаходить всі згадки дат у тексті"""
    dates = []

    # Патерни для пошуку дат
    patterns = [
        # "30 листопада/13 грудня" або "30 листопада"
        r'(\d{1,2})\s+(січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня)',
        # "17 / 30 січня"
        r'(\d{1,2})\s*/\s*(\d{1,2})\s+(січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня)',
        # Скорочені назви: "30 лис", "13 гру"
        r'(\d{1,2})\s+(січ|лют|бер|кві|тра|чер|лип|сер|вер|жов|лис|гру)\b',
    ]

    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            dates.append(match.group(0))

    return dates


def is_pagan_content(text):
    """Перевіряє, чи текст стосується язичницьких традицій"""
    text_lower = text.lower()

    # Якщо є християнські ключові слова - пропускаємо
    for keyword in CHRISTIAN_KEYWORDS:
        if keyword.lower() in text_lower:
            return False

    # Перевіряємо наявність язичницьких ключових слів
    for keyword in PAGAN_KEYWORDS:
        if keyword.lower() in text_lower:
            return True

    return False


def extract_event_info(text, date_str):
    """Витягує інформацію про подію навколо дати"""
    # Знаходимо контекст навколо дати (300 символів до і після)
    date_pos = text.find(date_str)
    if date_pos == -1:
        return None

    start = max(0, date_pos - 300)
    end = min(len(text), date_pos + 800)
    context = text[start:end]

    # Шукаємо назву події (зазвичай це слова великими літерами або після "--")
    event_pattern = r'([А-ЯЇІЄҐ][А-ЯЇІЄҐ\s]{3,50})\s*--'
    event_match = re.search(event_pattern, context)
    event_name = event_match.group(1).strip() if event_match else ""

    return {
        'date': date_str,
        'event_name': event_name,
        'context': context.strip()
    }


def normalize_date(date_str):
    """Нормалізує дату до формату ДД.ММ"""
    # Видаляємо другу дату, якщо є (наприклад, "30/13 грудня" -> "30 грудня")
    date_str = re.sub(r'(\d{1,2})\s*/\s*\d{1,2}', r'\1', date_str)

    # Знаходимо день і місяць
    match = re.search(r'(\d{1,2})\s+(\w+)', date_str)
    if not match:
        return None

    day = match.group(1).zfill(2)
    month_name = match.group(2).lower()

    month = MONTHS_MAP.get(month_name)
    if not month:
        return None

    return f"{day}.{month}"


def main():
    epub_dir = 'mifolohiia_extracted/EPUB'

    if not os.path.exists(epub_dir):
        print(f"Директорія {epub_dir} не знайдена!")
        return

    # Збираємо всі дані
    events_by_date = defaultdict(list)

    html_files = [f for f in os.listdir(epub_dir) if f.endswith('.html')]
    print(f"Знайдено {len(html_files)} HTML файлів")

    for i, html_file in enumerate(html_files, 1):
        if i % 50 == 0:
            print(f"Оброблено {i}/{len(html_files)} файлів...")

        html_path = os.path.join(epub_dir, html_file)
        text = extract_text_from_html(html_path)

        if not text:
            continue

        # Знаходимо дати
        dates = find_dates_in_text(text)

        for date_str in dates:
            # Витягуємо інформацію про подію
            event_info = extract_event_info(text, date_str)
            if not event_info:
                continue

            # Нормалізуємо дату
            normalized_date = normalize_date(date_str)
            if not normalized_date:
                continue

            # Зберігаємо подію
            events_by_date[normalized_date].append({
                'event_name': event_info['event_name'],
                'context': event_info['context'],
                'source_file': html_file,
                'is_pagan': is_pagan_content(event_info['context'])
            })

    print(f"\n✓ Знайдено подій для {len(events_by_date)} унікальних дат")

    # Зберігаємо результати
    with open('extracted_events.json', 'w', encoding='utf-8') as f:
        json.dump(events_by_date, f, ensure_ascii=False, indent=2)

    print(f"✓ Результати збережено у файл extracted_events.json")

    # Виводимо статистику
    print(f"\nСтатистика:")
    pagan_count = sum(1 for events in events_by_date.values()
                      for e in events if e['is_pagan'])
    total_count = sum(len(events) for events in events_by_date.values())
    print(f"  Всього подій: {total_count}")
    print(f"  Язичницьких подій: {pagan_count}")
    print(f"  Унікальних дат: {len(events_by_date)}")

    # Показуємо приклади
    print(f"\nПриклади знайдених дат:")
    for date in sorted(list(events_by_date.keys())[:10]):
        events = events_by_date[date]
        print(f"  {date}: {len(events)} подій")
        for event in events[:1]:
            if event['event_name']:
                print(f"    - {event['event_name']}")


if __name__ == '__main__':
    main()
