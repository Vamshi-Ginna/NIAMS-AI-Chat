# app/database.py
import mysql.connector
from mysql.connector import Error
from config import Config
import logging

logger = logging.getLogger("database")

class Database:
    def __init__(self):
        self.connection = None
    
    def connect(self):
         #Ensure the connection is established and ready to be used.
        if self.connection and self.connection.is_connected():
            return  # Avoid reconnecting if already connected
        try:
            self.connection = mysql.connector.connect(
                host=Config.MY_SQL_HOST,
                user=Config.MY_SQL_USER,
                password=Config.MY_SQL_PASSWORD,
                database=Config.MY_SQL_DB 
            )
            if self.connection.is_connected():
                logger.info("Successfully connected to MySQL")
                self.initialize_database()
        except Error as e:
            logger.error("Error while connecting to MySQL: %s", e)
            raise

    def column_exists(self, cursor, table_name, column_name):
        
        #Check if a specific column exists in a table.
        query = f"SHOW COLUMNS FROM {table_name} LIKE '{column_name}'"
        cursor.execute(query)
        result = cursor.fetchone()
        return result is not None
    
    def database_exists(self, cursor, db_name):
        cursor.execute(f"SHOW DATABASES LIKE '{db_name}'")
        result = cursor.fetchone()
        return result is not None

    def table_exists(self, cursor, table_name):
        cursor.execute(f"SHOW TABLES LIKE '{table_name}'")
        result = cursor.fetchone()
        return result is not None

    def initialize_database(self):
        cursor = self.connection.cursor()
        try:
            # Check if the database exists
            if self.database_exists(cursor, Config.MY_SQL_DB):
                logger.info(f"Database `{Config.MY_SQL_DB}` already exists.")
            else:
                cursor.execute(f"CREATE DATABASE `{Config.MY_SQL_DB}`")
                logger.info(f"Database `{Config.MY_SQL_DB}` created.")
            self.connection.database = Config.MY_SQL_DB

            # Create Users table
            if not self.table_exists(cursor, 'Users'):
                cursor.execute("""
                    CREATE TABLE Users (
                        user_id CHAR(36) PRIMARY KEY, 
                        name VARCHAR(255) NOT NULL,
                        group_name VARCHAR(255) DEFAULT NULL,       
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
                    )
                """)
                logger.info("Table `Users` created.")
            else:
                logger.info("Table `Users` already exists.")

            # Create Chat_Messages table
            if not self.table_exists(cursor, 'Chat_Messages'):
                cursor.execute("""
                    CREATE TABLE Chat_Messages (
                        message_id CHAR(36) PRIMARY KEY,
                        user_id CHAR(36),
                        user_prompt TEXT NOT NULL,
                        response TEXT NOT NULL,
                        source ENUM('OpenAI', 'Bing', 'Document') NOT NULL,
                        category VARCHAR(255) DEFAULT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
                    )
                """)
                logger.info("Table `Chat_Messages` created.")
            else:
                logger.info("Table `Chat_Messages` already exists.")

            # Create Feedback table
            if not self.table_exists(cursor, 'Feedback'):
                cursor.execute("""
                    CREATE TABLE Feedback (
                        feedback_id CHAR(36) PRIMARY KEY,
                        message_id CHAR(36),
                        rating INT CHECK (rating >= 1 AND rating <= 5),
                        comment TEXT,
                        user_id VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                        FOREIGN KEY (message_id) REFERENCES Chat_Messages(message_id) ON DELETE CASCADE,
                        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
                    )
                """)
                logger.info("Table `Feedback` created.")
            else:
                logger.info("Table `Feedback` already exists.")

            # Create Price table
            if not self.table_exists(cursor, 'Price'):
                cursor.execute("""
                    CREATE TABLE Price (
                        price_id CHAR(36) PRIMARY KEY,
                        message_id CHAR(36),
                        completion_price DECIMAL(10, 2) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                        FOREIGN KEY (message_id) REFERENCES Chat_Messages(message_id) ON DELETE CASCADE
                    )
                """)
                logger.info("Table `Price` created.")
            else:
                logger.info("Table `Price` already exists.")

            logger.info("All tables are initialized and ready.")
        except Error as e:
            logger.error("Error while initializing database: %s", e)
            raise
        finally:
            cursor.close()

    def run_migration(self):

        #Add columns to Users and Chat_Messages tables if they don't already exist.
        cursor = self.connection.cursor()
        try:
            # Check and add group_name column to Users table
            if not self.column_exists(cursor, 'Users', 'group_name'):
                cursor.execute("ALTER TABLE Users ADD COLUMN group_name VARCHAR(255) DEFAULT NULL;")
                logger.info("Added `group_name` column to Users table.")
            else:
                logger.info("Column `group_name` already exists in Users table.")

            # Check and add category column to Chat_Messages table
            if not self.column_exists(cursor, 'Chat_Messages', 'category'):
                cursor.execute("ALTER TABLE Chat_Messages ADD COLUMN category VARCHAR(255) DEFAULT NULL;")
                logger.info("Added `category` column to Chat_Messages table.")
            else:
                logger.info("Column `category` already exists in Chat_Messages table.")

            # Commit changes
            self.connection.commit()
        except Error as e:
            logger.error("Error while running migration: %s", e)
            raise
        finally:
            cursor.close()
    
    
    def execute_query(self, query, values=None):
        cursor = self.connection.cursor()
        try:
            cursor.execute(query, values)
            self.connection.commit()
        except Error as e:
            logger.error("Error executing query: %s", e)
            raise
        finally:
            cursor.close()

    #def __del__(self):
    def close(self):
        #Close the connection when the app is shutting down.
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("MySQL connection closed.")
