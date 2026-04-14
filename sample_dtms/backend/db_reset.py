import MySQLdb

try:
    db = MySQLdb.connect(host="localhost", user="root", passwd="user")
    cursor = db.cursor()
    cursor.execute("DROP DATABASE IF EXISTS dtms")
    cursor.execute("CREATE DATABASE dtms")
    cursor.execute("FLUSH PRIVILEGES")
    db.close()
    print("Database 'dtms' reset successfully.")
except Exception as e:
    print(f"Error connecting to MySQL: {e}")
