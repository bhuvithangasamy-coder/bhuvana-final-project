import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "resumeai.db")
conn = sqlite3.connect(db_path)
c = conn.cursor()
try:
    c.execute("ALTER TABLE applications ADD COLUMN phone VARCHAR(255)")
    conn.commit()
    print("Column added successfully")
except Exception as e:
    print("Error:", e)
conn.close()
