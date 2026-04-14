import MySQLdb
import sys

def connect_and_query(pwd):
    try:
        connection = MySQLdb.connect(host="localhost", user="root", password=pwd, database="DTMS")
        print(f"=== Successfully connected to MySQL database 'DTMS' with password '{pwd}' ===")
        cursor = connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT id, username, email, name, role FROM accounts_user;")
        records = cursor.fetchall()
        print("--- Output: Registered Users (accounts_user table) ---")
        if not records:
             print("No users found in the database.")
        else:
             for row in records:
                 print(f"ID: {row['id']}, Username: {row['username']}, Email: {row['email']}, Name: {row['name']}, Role: {row['role']}")
        return True
    except Exception as e:
        print(f"Error connecting with password '{pwd}': {e}")
        return False

# Attempt with common passwords
for pwd in ['root', '', '1234']:
    print(f"Trying password: '{pwd}'")
    if connect_and_query(pwd):
        break
