import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'resumeai.db')

def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    cols = [row[1] for row in cursor.fetchall()]
    return column in cols

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # Add created_at to applications
        if not column_exists(cursor, 'applications', 'created_at'):
            print('Adding created_at column to applications...')
            cursor.execute("ALTER TABLE applications ADD COLUMN created_at DATETIME DEFAULT (datetime('now'))")
        else:
            print('created_at already exists')

        # Add notes column
        if not column_exists(cursor, 'applications', 'notes'):
            print('Adding notes column to applications...')
            cursor.execute("ALTER TABLE applications ADD COLUMN notes TEXT")
        else:
            print('notes already exists')

        conn.commit()
        print('Migration complete.')
    except Exception as e:
        print('Migration failed:', e)
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
