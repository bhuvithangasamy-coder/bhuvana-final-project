import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'resumeai.db')

sql = """
DROP TABLE IF EXISTS recruiters;
-- Recruiter / Admin
CREATE TABLE recruiters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT,
    email TEXT,
    password TEXT
);

DROP TABLE IF EXISTS jobs;
-- Jobs
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recruiter_id INTEGER,
    title TEXT,
    location TEXT,
    salary TEXT,
    job_type TEXT,
    skills TEXT,
    description TEXT,
    status TEXT DEFAULT 'Active'
);

DROP TABLE IF EXISTS applications;
-- Applications
CREATE TABLE applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    name TEXT,
    email TEXT,
    resume TEXT,
    status TEXT DEFAULT 'Pending'
);
"""

def setup_db():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.executescript(sql)
    conn.commit()
    conn.close()
    print("Successfully added recruiters, jobs, and applications tables.")

if __name__ == '__main__':
    setup_db()
