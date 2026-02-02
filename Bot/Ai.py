from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

def ask_ai(user_text: str) -> str:
    try:
        completion = client.chat.completions.create(
            model="nex-agi/deepseek-v3.1-nex-n1:free",
            messages=[
                {"role": "user", "content": user_text}
            ],
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"❌ AI Fehler: {e}"
