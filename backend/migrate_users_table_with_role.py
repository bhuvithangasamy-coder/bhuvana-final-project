import sqlite3
import shutil

DB_PATH = 'resumeai.db'
BACKUP_PATH = 'resumeai_backup.db'

# Backup the database
shutil.copy(DB_PATH, BACKUP_PATH)
print('Database backed up as resumeai_backup.db')

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

try:
    # Create new users table with role column
    cursor.execute('''
        CREATE TABLE users_new (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'job_seeker',
            created_at DATETIME,
            updated_at DATETIME
        )'
    ''')
    # Copy data from old users table, set default role
    cursor.execute('''
        INSERT INTO users_new (id, username, email, password, created_at, updated_at)
        SELECT id, username, email, password, created_at, updated_at FROM users
    ''')
    # Drop old users table
    cursor.execute('DROP TABLE users')
    # Rename new table
    cursor.execute('ALTER TABLE users_new RENAME TO users')
    conn.commit()
    print('Migration successful: role column added to users table.')
except Exception as e:
    print(f'Migration failed: {e}')
    conn.rollback()

conn.close()
