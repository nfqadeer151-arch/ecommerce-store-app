import tkinter as tk
from tkinter import ttk, messagebox

class LoginUI(tk.Frame):
    def __init__(self, parent):
        super().__init__(parent, bg="#2E3440")
        self.parent = parent
        self.place(relx=0.5, rely=0.5, anchor="center")

        # UI Elements for Login
        lbl_title = tk.Label(self, text="Admin Login", font=("Helvetica", 16, "bold"), bg="#2E3440", fg="#ECEFF4")
        lbl_title.grid(row=0, column=0, columnspan=2, pady=10)

        lbl_user = tk.Label(self, text="Username:", bg="#2E3440", fg="#D8DEE9")
        lbl_user.grid(row=1, column=0, pady=5, padx=5, sticky="e")
        self.entry_user = tk.Entry(self)
        self.entry_user.grid(row=1, column=1, pady=5, padx=5)

        lbl_pass = tk.Label(self, text="Password:", bg="#2E3440", fg="#D8DEE9")
        lbl_pass.grid(row=2, column=0, pady=5, padx=5, sticky="e")
        self.entry_pass = tk.Entry(self, show="*")
        self.entry_pass.grid(row=2, column=1, pady=5, padx=5)

        btn_login = tk.Button(self, text="Login", command=self.login, bg="#88C0D0", fg="#2E3440", font=("Helvetica", 10, "bold"))
        btn_login.grid(row=3, column=0, columnspan=2, pady=15, ipadx=10)

    def login(self):
        username = self.entry_user.get()
        password = self.entry_pass.get()
        
        # Stub logic for login
        if username == "admin" and password == "admin":
            messagebox.showinfo("Success", "Login Successful!")
            # Will redirect to main dashboard later
        else:
            messagebox.showerror("Error", "Invalid username or password")
