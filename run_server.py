import uvicorn
import os
import sys

def main():
    print("------------------------------------------")
    print("AI Mock Interviewer Backend")
    print("------------------------------------------")
    
    # 1. Create necessary folders
    folders = ["app", "uploads", "audio_outputs", "chromadb_storage"]
    for folder in folders:
        if not os.path.exists(folder):
            os.makedirs(folder)
            print(f"Created: {folder}/")

    # 2. Add current folder to Python path
    sys.path.insert(0, os.getcwd())

    # 3. Check for main file
    if not os.path.exists("app/main.py"):
        print("ERROR: app/main.py not found.")
        print("Please ensure you are running this from the project folder.")
        return

    print("Starting server at http://localhost:8000")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
