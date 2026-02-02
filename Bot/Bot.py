import os
import json
import threading
import asyncio
import requests
import xml.etree.ElementTree as ET
from datetime import date
from dotenv import load_dotenv
from flask import Flask
from bs4 import BeautifulSoup

from telegram import (
    Update,
    KeyboardButton,
    ReplyKeyboardMarkup,
    WebAppInfo
)
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters
)

from Ai import ask_ai

# ==================== ENV ====================
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_ID = int(os.getenv("ADMIN_ID"))  # 🔥 ВАЖНО

# ==================== Flask ====================
flask_app = Flask(__name__)

@flask_app.route("/")
def home():
    return "✅ Bot läuft"

# ==================== USERS ====================
USERS_FILE = "users.json"

def load_users():
    if not os.path.exists(USERS_FILE):
        return set()
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return set(json.load(f))

def save_user(user_id: int):
    users = load_users()
    if user_id not in users:
        users.add(user_id)
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(list(users), f)

# ==================== AI LIMIT ====================
DAILY_LIMIT = 3
USER_AI_USAGE = {}
LIMIT_MESSAGE_DE = "Ich bin ein kostenloses KI-Modell, komm morgen wieder 🙂"

def can_use_ai(user_id: int) -> bool:
    today = date.today()

    if user_id not in USER_AI_USAGE:
        USER_AI_USAGE[user_id] = {"date": today, "count": 0}

    if USER_AI_USAGE[user_id]["date"] != today:
        USER_AI_USAGE[user_id] = {"date": today, "count": 0}

    if USER_AI_USAGE[user_id]["count"] >= DAILY_LIMIT:
        return False

    USER_AI_USAGE[user_id]["count"] += 1
    return True

# ==================== START ====================
async def starten(update: Update, context: ContextTypes.DEFAULT_TYPE):
    save_user(update.message.chat_id)

    webapp_button = KeyboardButton(
        text="🚀 WebApp öffnen",
        web_app=WebAppInfo(url="https://dehub-webapp.vercel.app")
    )
    reply_markup = ReplyKeyboardMarkup([[webapp_button]], resize_keyboard=True)

    await update.message.reply_text(
        "👋 Hallo!\n\n"
        "🤖 Schreib mir eine Nachricht – ich antworte\n"
        "🧠 3 KI-Anfragen pro Tag\n"
        "🗞️ /neuigkeiten für News",
        reply_markup=reply_markup
    )

# ==================== NEWS ====================
NEWS_SITES = [
    {"type": "rss", "url": "https://www.tagesschau.de/xml/rss2"},
    {"type": "rss", "url": "https://rss.dw.com/xml/rss-de-all"},
    {"type": "html", "url": "https://www.zdf.de/nachrichten/heute"},
]

USER_INDEX = {}

def parse_rss(url):
    r = requests.get(url, timeout=5)
    root = ET.fromstring(r.content)
    item = root.find("./channel/item")
    if not item:
        return None
    return {
        "title": item.find("title").text,
        "summary": item.find("description").text,
        "link": item.find("link").text
    }

def parse_zdf(url):
    r = requests.get(url, timeout=5)
    soup = BeautifulSoup(r.text, "html.parser")
    article = soup.find("article")
    if not article:
        return None
    return {
        "title": article.find("h2").text,
        "summary": article.find("p").text,
        "link": url
    }

def get_next_news(user_id):
    index = USER_INDEX.get(user_id, 0)
    site = NEWS_SITES[index % len(NEWS_SITES)]
    USER_INDEX[user_id] = index + 1
    return parse_rss(site["url"]) if site["type"] == "rss" else parse_zdf(site["url"])

async def neuigkeiten(update: Update, context: ContextTypes.DEFAULT_TYPE):
    save_user(update.message.chat_id)
    news = get_next_news(update.message.chat_id)
    if not news:
        await update.message.reply_text("❌ Keine Nachrichten")
        return

    await update.message.reply_text(
        f"*{news['title']}*\n\n{news['summary']}\n\n🔗 {news['link']}",
        parse_mode="Markdown"
    )

# ==================== AI CHAT ====================
async def ai_chat(update: Update, context: ContextTypes.DEFAULT_TYPE):
    save_user(update.message.chat_id)

    if not can_use_ai(update.message.chat_id):
        await update.message.reply_text(LIMIT_MESSAGE_DE)
        return

    async def typing():
        while True:
            await update.message.chat.send_action("typing")
            await asyncio.sleep(4)

    task = asyncio.create_task(typing())
    try:
        answer = await asyncio.to_thread(ask_ai, update.message.text)
        await update.message.reply_text(answer)
    finally:
        task.cancel()

# ==================== BROADCAST ====================
async def broadcast(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.chat_id != ADMIN_ID:
        await update.message.reply_text("❌ Keine Berechtigung")
        return

    if not context.args:
        await update.message.reply_text("/broadcast Text")
        return

    users = load_users()
    msg = "📢 *Update*\n\n" + " ".join(context.args)

    sent = 0
    for uid in users:
        try:
            await context.bot.send_message(uid, msg, parse_mode="Markdown")
            sent += 1
            await asyncio.sleep(0.05)
        except:
            pass

    await update.message.reply_text(f"✅ Gesendet an {sent} Benutzer")

# ==================== RUN ====================
def run_flask():
    flask_app.run(host="0.0.0.0", port=10000)

def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", starten))
    app.add_handler(CommandHandler("starten", starten))
    app.add_handler(CommandHandler("neuigkeiten", neuigkeiten))
    app.add_handler(CommandHandler("broadcast", broadcast))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, ai_chat))

    app.run_polling()

if __name__ == "__main__":
    threading.Thread(target=run_flask, daemon=True).start()
    main()
