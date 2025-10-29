#pip install psycopg2


import psycopg2
import csv
import os

# --- 1. Database connection details ---
DB_CONFIG = {
    "host": "localhost",          # or your host
    "database": "rfidr",  # change this
    "user": "postgres",      # change this
    "password": "Shagi02@",  # change this
    "port": "5432"                # default port
}

# --- 2. Connect to PostgreSQL ---
conn = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

# --- 3. Create a folder for CSV outputs ---
output_folder = "exports"
os.makedirs(output_folder, exist_ok=True)

# --- 4. Get all public table names ---
cursor.execute("""
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
""")
tables = [t[0] for t in cursor.fetchall()]

# --- 5. Export each table as CSV ---
for table in tables:
    cursor.execute(f"SELECT * FROM {table};")
    rows = cursor.fetchall()
    headers = [desc[0] for desc in cursor.description]

    csv_path = os.path.join(output_folder, f"{table}.csv")

    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"✅ Exported table '{table}' → {csv_path}")

# --- 6. Close connection ---
cursor.close()
conn.close()

print("\n🎉 All tables exported successfully!")
