import MySQLdb
import sys

def connect_and_query(pwd):
    try:
        connection = MySQLdb.connect(host="localhost", user="root", password=pwd, database="DTMS")
        print(f"=== Successfully connected to MySQL database 'DTMS' with password '{pwd}' ===")
        cursor = connection.cursor()
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        print("--- Tables in 'DTMS' ---")
        if not tables:
             print("No tables found in the database. You might need to run Django migrations.")
        else:
             for table in tables:
                 print(table[0])
        return True
    except Exception as e:
        print(f"Error connecting with password '{pwd}': {e}")
        return False

# Attempt with common passwords
for pwd in ['root', '', '1234']:
    print(f"Trying password: '{pwd}'")
    if connect_and_query(pwd):
        break
