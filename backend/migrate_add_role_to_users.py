import sqlite3

DB_PATH = 'resumeai.db'  # Adjust if your DB file is elsewhere

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'job_seeker' NOT NULL")
    print('Migration successful: role column added to users table.')
except Exception as e:
    print(f'Migration failed: {e}')

conn.commit()
conn.close()
