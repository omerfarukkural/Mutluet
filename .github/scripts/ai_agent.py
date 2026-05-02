import os
import sys
import requests
import json

def update_code_with_ai(prompt, target_file):
    api_key = os.getenv("AI_API_KEY")
    if not api_key:
        print("Error: AI_API_KEY not found in environment.")
        sys.exit(1)

    print(f"Instruction: {prompt}")
    print(f"Targeting: {target_file}")

    with open(target_file, "r") as f:
        original_code = f.read()

    # System prompt to guide the AI
    system_message = (
        "You are an expert Flutter developer. You will receive a code file and an instruction. "
        "Return ONLY the updated code. Do not include markdown code blocks (```dart), "
        "do not include explanations. Just the raw code."
    )

    # This example uses Google Gemini API (standard REST)
    # You can change this to Claude or OpenAI as needed.
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [{
                "text": f"{system_message}\n\nORIGINAL CODE:\n{original_code}\n\nINSTRUCTION:\n{prompt}"
            }]
        }]
    }

    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        new_code = result['candidates'][0]['content']['parts'][0]['text']
        
        # Clean up any potential markdown backticks if AI ignored instructions
        new_code = new_code.replace("```dart", "").replace("```", "").strip()

        with open(target_file, "w") as f:
            f.write(new_code)
        print(f"Successfully updated {target_file}")
    else:
        print(f"AI API Error: {response.text}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python ai_agent.py <prompt> <file_path>")
        sys.exit(1)
    
    update_code_with_ai(sys.argv[1], sys.argv[2])
