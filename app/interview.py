
import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"

def call_ollama(prompt, system_prompt):
    payload = {
        "model": "llama3",
        "prompt": f"{system_prompt}\n\nUser: {prompt}\nAI:",
        "stream": False
    }
    response = requests.post(OLLAMA_URL, json=payload)
    if response.status_code == 200:
        return response.json().get("response", "")
    return "Error communicating with LLM."

def get_hr_system_prompt(resume_text):
    return f"""You are a professional IT HR interviewer.
Conduct a realistic voice interview. 
Here is the candidate's resume summary: {resume_text}

Rules:
1. Ask one clear question at a time.
2. Ask technical and behavioral questions based on the resume.
3. Be professional and strict.
4. Conclude the interview after about 6-8 exchanges by saying 'This concludes our interview. Thank you.'
"""

def evaluate_candidate(context):
    eval_prompt = f"""Evaluate the following interview transcript:
{context}

Provide a JSON object with:
- rating (integer 1-10)
- strengths (list of strings)
- weaknesses (list of strings)
- suggestions (list of strings)
- recommended_roles (list of strings)
"""
    result = call_ollama(eval_prompt, "You are an expert HR analyst.")
    try:
        # Simple extraction if LLM adds extra text
        start = result.find('{')
        end = result.rfind('}') + 1
        return json.loads(result[start:end])
    except:
        return {
            "rating": 5,
            "strengths": ["Communication"],
            "weaknesses": ["Unclear"],
            "suggestions": ["Practice more"],
            "recommended_roles": ["Junior Developer"]
        }
