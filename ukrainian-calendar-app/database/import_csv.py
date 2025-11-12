#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для імпорту CSV даних в PostgreSQL
"""

import csv
import psycopg2
from psycopg2.extras import execute_values
import os

# Налаштування підключення до БД
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'ukrainian_calendar'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres')
}

CSV_FILE = '../ukrainian_pagan_calendar_FINAL.csv'


def connect_db():
    """Підключення до PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print(f"✓ Підключено до БД {DB_CONFIG['database']}")
        return conn
    except Exception as e:
        print(f"✗ Помилка підключення до БД: {e}")
        exit(1)


def create_database_if_not_exists():
    """Створює базу даних якщо вона не існує"""
    try:
        # Підключаємось до postgres БД для створення нашої БД
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            database='postgres',
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        conn.autocommit = True
        cursor = conn.cursor()

        # Перевіряємо чи існує БД
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (DB_CONFIG['database'],)
        )
        exists = cursor.fetchone()

        if not exists:
            cursor.execute(f"CREATE DATABASE {DB_CONFIG['database']}")
            print(f"✓ Створено базу даних {DB_CONFIG['database']}")
        else:
            print(f"✓ База даних {DB_CONFIG['database']} вже існує")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"✗ Помилка створення БД: {e}")


def create_schema(conn):
    """Створює схему БД"""
    try:
        with open('schema.sql', 'r', encoding='utf-8') as f:
            schema_sql = f.read()

        cursor = conn.cursor()
        cursor.execute(schema_sql)
        conn.commit()
        cursor.close()
        print("✓ Схема БД створена")
    except Exception as e:
        print(f"✗ Помилка створення схеми: {e}")
        conn.rollback()


def import_csv_data(conn):
    """Імпортує дані з CSV"""
    try:
        cursor = conn.cursor()

        # Читаємо CSV
        events_data = []
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                date = row['Дата'].strip()
                if not date or '.' not in date:
                    continue

                try:
                    day, month = date.split('.')
                    day = int(day)
                    month = int(month)

                    title = row.get('Подія', '').strip()
                    description = row.get('Опис', '').strip()
                    traditions = row.get('Традиції', '').strip()
                    preparation = row.get('Як підготуватися', '').strip()

                    # Якщо немає назви, генеруємо з дати
                    if not title:
                        title = f"День {day:02d}.{month:02d}"

                    events_data.append((
                        day, month, title, description, traditions, preparation
                    ))
                except ValueError:
                    continue

        # Вставляємо дані
        if events_data:
            insert_query = """
                INSERT INTO events (date_day, date_month, title, description, traditions, preparation)
                VALUES %s
                ON CONFLICT (date_day, date_month)
                DO UPDATE SET
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    traditions = EXCLUDED.traditions,
                    preparation = EXCLUDED.preparation,
                    updated_at = CURRENT_TIMESTAMP
            """
            execute_values(cursor, insert_query, events_data)
            conn.commit()
            print(f"✓ Імпортовано {len(events_data)} подій")
        else:
            print("⚠ Немає даних для імпорту")

        cursor.close()
    except Exception as e:
        print(f"✗ Помилка імпорту CSV: {e}")
        conn.rollback()


def verify_import(conn):
    """Перевіряє результат імпорту"""
    try:
        cursor = conn.cursor()

        # Загальна кількість подій
        cursor.execute("SELECT COUNT(*) FROM events")
        total = cursor.fetchone()[0]
        print(f"\n📊 Статистика:")
        print(f"  Всього подій в БД: {total}")

        # Кількість заповнених подій
        cursor.execute("""
            SELECT COUNT(*) FROM events
            WHERE title != '' AND description IS NOT NULL AND description != ''
        """)
        filled = cursor.fetchone()[0]
        print(f"  Заповнених подій: {filled}")

        # Приклади подій
        cursor.execute("""
            SELECT date_day, date_month, title
            FROM events
            WHERE description IS NOT NULL AND description != ''
            ORDER BY date_month, date_day
            LIMIT 5
        """)
        examples = cursor.fetchall()

        print(f"\n📅 Приклади подій:")
        for day, month, title in examples:
            print(f"  {day:02d}.{month:02d} - {title}")

        cursor.close()
    except Exception as e:
        print(f"✗ Помилка перевірки: {e}")


def main():
    print("=" * 60)
    print("📥 Імпорт даних в PostgreSQL")
    print("=" * 60)
    print()

    # Створюємо БД якщо не існує
    create_database_if_not_exists()

    # Підключаємось
    conn = connect_db()

    # Створюємо схему
    create_schema(conn)

    # Імпортуємо дані
    import_csv_data(conn)

    # Перевіряємо
    verify_import(conn)

    # Закриваємо з'єднання
    conn.close()

    print()
    print("=" * 60)
    print("✅ Імпорт завершено успішно!")
    print("=" * 60)


if __name__ == '__main__':
    main()
