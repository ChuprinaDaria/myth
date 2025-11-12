#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Створення фінального CSV календаря на 365 днів
"""

import csv
from datetime import datetime, timedelta


def load_quality_data():
    """Завантажує якісні дані з існуючого CSV"""
    quality_data = {}

    try:
        with open('podii_z_tradytsiiamy_refined (2).csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                date = row['Дата'].strip().strip('"')

                # Пропускаємо некоректні записи
                if not date or date in [';;;;', ''] or '.' not in date:
                    continue

                try:
                    parts = date.split('.')
                    if len(parts) == 2:
                        day = parts[0].strip().zfill(2)
                        month = parts[1].strip().zfill(2)
                        normalized_date = f"{day}.{month}"

                        event = row.get('Подія', '').strip().strip('"')
                        desc = row.get('Опис', '').strip().strip('"')
                        trad = row.get('Традиції', '').strip().strip('"')
                        prep = row.get('Як підготуватися', '').strip().strip('"')

                        # Зберігаємо тільки якщо є хоч щось змістовне
                        if event or (desc and len(desc) > 50):
                            quality_data[normalized_date] = {
                                'event': event,
                                'description': desc,
                                'traditions': trad,
                                'preparation': prep
                            }
                except:
                    continue
    except Exception as e:
        print(f"Помилка читання CSV: {e}")

    print(f"✓ Завантажено {len(quality_data)} якісних записів")
    return quality_data


def generate_365_days():
    """Генерує список з 365 днів (без 29 лютого)"""
    dates = []
    start_date = datetime(2023, 1, 1)  # 2023 - не високосний

    for i in range(365):
        current_date = start_date + timedelta(days=i)
        date_str = current_date.strftime("%d.%m")
        dates.append(date_str)

    return dates


def create_final_csv():
    """Створює фінальний CSV календар"""
    quality_data = load_quality_data()
    all_dates = generate_365_days()

    output_file = 'ukrainian_calendar_365_days.csv'

    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Дата', 'Подія', 'Опис', 'Традиції', 'Як підготуватися']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        filled_count = 0

        for date_str in all_dates:
            row = {'Дата': date_str}

            if date_str in quality_data:
                data = quality_data[date_str]
                row['Подія'] = data['event']
                row['Опис'] = data['description']
                row['Традиції'] = data['traditions']
                row['Як підготуватися'] = data['preparation']
                filled_count += 1
            else:
                row['Подія'] = ''
                row['Опис'] = ''
                row['Традиції'] = ''
                row['Як підготуватися'] = ''

            writer.writerow(row)

    print(f"\n✓ Створено файл {output_file}")
    print(f"✓ Всього днів: {len(all_dates)}")
    print(f"✓ Заповнено якісними даними: {filled_count}")
    print(f"✓ Потребує доповнення: {len(all_dates) - filled_count}")

    # Показуємо які дати заповнені
    if filled_count > 0:
        print(f"\nЗаповнені дати:")
        for date in sorted(quality_data.keys()):
            event = quality_data[date]['event']
            if event:
                print(f"  {date}: {event}")


if __name__ == '__main__':
    print("Створення фінального календаря на 365 днів...\n")
    create_final_csv()
    print("\n✅ Готово!")
