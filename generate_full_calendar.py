#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для створення повного CSV календаря на 365 днів
"""

import json
import csv
from datetime import datetime, timedelta
from collections import defaultdict


def load_existing_csv():
    """Завантажує існуючі дані з CSV файлу №2"""
    existing_data = {}

    try:
        with open('podii_z_tradytsiiamy_refined (2).csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                date = row['Дата'].strip()
                # Пропускаємо порожні та некоректні записи
                if date and date not in [';;;;', '""";;;;', ''] and '.' in date:
                    try:
                        # Перевіряємо формат ДД.ММ
                        parts = date.split('.')
                        if len(parts) == 2:
                            day = parts[0].strip('"')
                            month = parts[1].strip('"')
                            if day.isdigit() and month.isdigit():
                                normalized_date = f"{day.zfill(2)}.{month.zfill(2)}"
                                existing_data[normalized_date] = {
                                    'event': row.get('Подія', '').strip(),
                                    'description': row.get('Опис', '').strip(),
                                    'traditions': row.get('Традиції', '').strip(),
                                    'preparation': row.get('Як підготуватися', '').strip()
                                }
                    except:
                        pass
    except Exception as e:
        print(f"Помилка читання CSV: {e}")

    print(f"✓ Завантажено {len(existing_data)} записів з існуючого CSV")
    return existing_data


def load_extracted_events():
    """Завантажує витягнуті з EPUB дані"""
    try:
        with open('extracted_events.json', 'r', encoding='utf-8') as f:
            events = json.load(f)
        print(f"✓ Завантажено {len(events)} дат з EPUB")
        return events
    except Exception as e:
        print(f"Помилка читання JSON: {e}")
        return {}


def generate_all_dates():
    """Генерує список всіх дат року"""
    dates = []
    start_date = datetime(2024, 1, 1)  # 2024 - високосний рік

    for i in range(366):  # 366 днів для високосного року
        current_date = start_date + timedelta(days=i)
        date_str = current_date.strftime("%d.%m")
        dates.append(date_str)

    return dates


def clean_text(text):
    """Очищає текст від зайвих символів"""
    if not text:
        return ""

    # Видаляємо зайві лапки та крапки з комою
    text = text.replace('""""', '').replace('"""', '').replace(';;;;', '')
    text = text.strip('"').strip()
    return text


def extract_event_details(events_list):
    """Витягує деталі події зі списку подій"""
    if not events_list:
        return "", "", ""

    # Шукаємо найбільш релевантну язичницьку подію
    pagan_events = [e for e in events_list if e.get('is_pagan', False)]

    if not pagan_events and not events_list:
        return "", "", ""

    # Вибираємо першу язичницьку подію або першу будь-яку
    event = pagan_events[0] if pagan_events else events_list[0]

    event_name = clean_text(event.get('event_name', ''))
    context = clean_text(event.get('context', ''))

    # Розділяємо контекст на опис та традиції
    # Якщо є слово "Літ.:" - це початок літератури, обрізаємо
    if 'Літ.:' in context:
        context = context.split('Літ.:')[0].strip()

    # Обмежуємо довжину
    if len(context) > 1000:
        context = context[:1000] + "..."

    return event_name, context, ""


def get_seasonal_info(month):
    """Повертає сезонну інформацію для місяця"""
    seasons = {
        1: ("Зима", "Час зимових свят, коляд та щедрівок. Період відпочинку природи."),
        2: ("Зима", "Останній місяць зими. Час підготовки до весни."),
        3: ("Весна", "Початок весни. Час пробудження природи та весняних обрядів."),
        4: ("Весна", "Розквіт весни. Час великодніх та весняних традицій."),
        5: ("Весна", "Пізня весна. Час зелених свят та закличних обрядів."),
        6: ("Літо", "Початок літа. Час купальських свят та літніх обрядів."),
        7: ("Літо", "Розпал літа. Час жнив та літніх традицій."),
        8: ("Літо", "Кінець літа. Час спасівських свят та збору врожаю."),
        9: ("Осінь", "Початок осені. Час осінніх обрядів та подяки за врожай."),
        10: ("Осінь", "Розпал осені. Час підготовки до зими."),
        11: ("Осінь", "Пізня осінь. Час завершення польових робіт."),
        12: ("Зима", "Початок зими. Час зимових свят та підготовки до Нового року."),
    }
    return seasons.get(month, ("", ""))


def generate_calendar_csv():
    """Генерує повний CSV календар"""

    # Завантажуємо дані
    existing_data = load_existing_csv()
    extracted_events = load_extracted_events()
    all_dates = generate_all_dates()

    # Підготовка CSV
    output_file = 'ukrainian_pagan_calendar_full.csv'

    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Дата', 'Подія', 'Опис', 'Традиції', 'Як підготуватися']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        filled_count = 0

        for date_str in all_dates:
            row = {'Дата': date_str}

            # Пріоритет 1: Існуючі дані з CSV
            if date_str in existing_data:
                data = existing_data[date_str]
                row['Подія'] = data['event']
                row['Опис'] = data['description']
                row['Традиції'] = data['traditions']
                row['Як підготуватися'] = data['preparation']
                filled_count += 1

            # Пріоритет 2: Витягнуті дані з EPUB
            elif date_str in extracted_events:
                event_name, description, traditions = extract_event_details(extracted_events[date_str])
                row['Подія'] = event_name
                row['Опис'] = description
                row['Традиції'] = traditions
                row['Як підготуватися'] = ""
                if event_name or description:
                    filled_count += 1

            # Пріоритет 3: Порожнє поле (для ручного заповнення)
            else:
                # Додаємо сезонну інформацію як підказку
                month = int(date_str.split('.')[1])
                season, season_info = get_seasonal_info(month)
                row['Подія'] = ""
                row['Опис'] = ""
                row['Традиції'] = ""
                row['Як підготуватися'] = ""

            writer.writerow(row)

    print(f"\n✓ Створено файл {output_file}")
    print(f"✓ Всього днів: {len(all_dates)}")
    print(f"✓ Заповнено днів: {filled_count}")
    print(f"✓ Порожніх днів: {len(all_dates) - filled_count}")


if __name__ == '__main__':
    print("Генерація повного календаря українських язичницьких свят...\n")
    generate_calendar_csv()
    print("\n✅ Готово!")
