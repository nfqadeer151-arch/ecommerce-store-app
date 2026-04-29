import tkinter as tk
from tkinter import messagebox
import os
import sys

# Ensure the app can find modules in subdirectories
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import init_db
from ui.login_ui import LoginUI

def main():
    # Initialize the database (create db and tables if they don't exist)
    try:
        init_db()
    except Exception as e:
        print(f"Database initialization failed: {e}")
        # We can still proceed to show the Tkinter window but it might fail on login
        # Usually, you'd show a connection error window here.

    root = tk.Tk()
    root.title("Library Management System")
    root.geometry("400x300")
    
    # Configure grid layout
    root.columnconfigure(0, weight=1)
    root.rowconfigure(0, weight=1)

    # Styling configuration
    root.configure(bg="#2E3440") # Dark mode background
    
    # Start with the Login UI
    app = LoginUI(root)

    root.mainloop()

if __name__ == "__main__":
    main()
