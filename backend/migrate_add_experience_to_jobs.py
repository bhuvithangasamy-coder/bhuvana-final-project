import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'resumeai.db')

def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info('{table}')")
    cols = [row[1] for row in cursor.fetchall()]
    return column in cols

def add_experience_column():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    if column_exists(cur, 'jobs', 'experience'):
        print('Column "experience" already exists in jobs table.')
    else:
        try:
            cur.execute("ALTER TABLE jobs ADD COLUMN experience TEXT")
            conn.commit()
            print('Added column "experience" to jobs table.')
        except sqlite3.OperationalError as e:
            print('Failed to add column:', e)
    conn.close()

if __name__ == '__main__':
    add_experience_column()
