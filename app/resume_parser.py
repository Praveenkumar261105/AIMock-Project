
import pdfplumber
import json

def parse_resume(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    
    # Very simple extraction logic
    lines = text.split('\n')
    name = lines[0] if lines else "Unknown"
    
    skills = []
    experience = []
    education = []
    
    current_section = None
    for line in lines:
        l = line.lower()
        if "skills" in l:
            current_section = "skills"
            continue
        elif "experience" in l:
            current_section = "experience"
            continue
        elif "education" in l:
            current_section = "education"
            continue
            
        if current_section == "skills":
            skills.append(line)
        elif current_section == "experience":
            experience.append(line)
        elif current_section == "education":
            education.append(line)
            
    return {
        "raw_text": text,
        "name": name,
        "skills": ", ".join(skills[:10]),
        "experience": "\n".join(experience[:5]),
        "education": "\n".join(education[:5]),
        "projects": ""
    }
