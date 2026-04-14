import MySQLdb
import sys

with open('results_newDTMS.txt', 'w', encoding='utf-8') as f:
    def log(msg):
        print(msg)
        f.write(msg + '\n')

    try:
        # Connecting to the specified database and password
        connection = MySQLdb.connect(host="localhost", user="root", password="1234", database="newDTMS")
        log("=== Successfully connected to MySQL database 'newDTMS' with password '1234' ===")
        cursor = connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        
        if not tables:
             log("--- Tables in 'newDTMS' ---")
             log("No tables found in the database. The database exists, but you need to run Django migrations.")
        else:
             log("--- Tables in 'newDTMS' ---")
             for table in tables:
                 log(list(table.values())[0])

             # If accounts_user table exists, display its records
             table_names = [list(t.values())[0] for t in tables]
             if 'accounts_user' in table_names:
                 cursor.execute("SELECT id, username, email, name, role FROM accounts_user;")
                 records = cursor.fetchall()
                 log("\n--- Output: Registered Users (accounts_user table) ---")
                 if not records:
                     log("No users found in the 'accounts_user' table.")
                 else:
                     for row in records:
                         log(f"ID: {row['id']}, Username: {row['username']}, Email: {row['email']}, Name: {row['name']}, Role: {row['role']}")

    except Exception as e:
        log(f"Error connecting: {e}")
    finally:
        if 'connection' in locals() and connection.open:
            cursor.close()
            connection.close()
