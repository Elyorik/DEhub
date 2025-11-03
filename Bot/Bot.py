import os
import asyncio
import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from flask import Flask, request
from dotenv import load_dotenv
from telegram import Update, Bot, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

# Load env
load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

# Flask app
flask_app = Flask(__name__)

@flask_app.route("/")
def home():
    return "✅ Bot & Webhook running on Render!"

# Telegram bot
bot = Bot(BOT_TOKEN)
application = Application.builder().token(BOT_TOKEN).build()

# ---------------- NEWS LOGIC ----------------
NEWS_SITES = [
    {"type": "rss", "url": "https://www.tagesschau.de/xml/rss2"},
    {"type": "rss", "url": "https://rss.dw.com/xml/rss-de-all"},
    {"type": "html", "url": "https://www.zdf.de/nachrichten/heute"},
    {"type": "rss", "url": "https://www.n-tv.de/rss"},
    {"type": "rss", "url": "https://www.stern.de/feed/"},
    {"type": "rss", "url": "https://www.focus.de/rss/"},
]

USER_INDEX = {}

async def starten(update: Update, context: ContextTypes.DEFAULT_TYPE):
    btn = KeyboardButton(
        text="🚀 WebApp öffnen",
        web_app=WebAppInfo(url="https://dehub-webapp.vercel.app")
    )
    await update.message.reply_text(
        "👋 Willkommen!\n"
        "/neuigkeiten → News 🗞️",
        reply_markup=ReplyKeyboardMarkup([[btn]], resize_keyboard=True)
    )

def parse_rss(url):
    try:
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        item = ET.fromstring(r.content).find("./channel/item")
        if not item: return None
        return {
            "title": item.find("title").text,
            "summary": item.find("description").text,
            "link": item.find("link").text,
            "image": item.find("enclosure").attrib["url"]
                if item.find("enclosure") is not None else None
        }
    except: return None

def parse_zdf(url):
    try:
        r = requests.get(url, timeout=5)
        soup = BeautifulSoup(r.text, "html.parser")
        a = soup.find("article")
        t = a.find("h2").get_text(strip=True)
        s = a.find("p").get_text(strip=True)
        img = a.find("img")["src"] if a.find("img") else None
        link = "https://www.zdf.de" + a.find("a")["href"]
        return {"title": t, "summary": s, "link": link, "image": img}
    except: return None

def next_news(uid):
    i = USER_INDEX.get(uid, 0)
    site = NEWS_SITES[i % len(NEWS_SITES)]
    USER_INDEX[uid] = i + 1
    return parse_rss(site["url"]) if site["type"]=="rss" else parse_zdf(site["url"])

async def neuigkeiten(update: Update, context: ContextTypes.DEFAULT_TYPE):
    n = next_news(update.message.chat.id)
    if not n:
        return await update.message.reply_text("❌ Keine News gefunden.")
    msg = f"**{n['title']}**\n\n{n['summary']}\n\n🔗 {n['link']}"
    if n["image"]:
        await update.message.reply_photo(n["image"], caption=msg, parse_mode="Markdown")
    else:
        await update.message.reply_text(msg, parse_mode="Markdown")

application.add_handler(CommandHandler("starten", starten))
application.add_handler(CommandHandler("neuigkeiten", neuigkeiten))

# ---------------- WEBHOOK ----------------
@flask_app.post(f"/{BOT_TOKEN}")
async def webhook():
    data = request.get_json(force=True)
    update = Update.de_json(data, bot)
    await application.process_update(update)
    return "ok"

async def start_bot():
    url = f"https://dehub.onrender.com/{BOT_TOKEN}"
    await bot.set_webhook(url)
    print("✅ Webhook:", url)

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(start_bot())
    flask_app.run(host="0.0.0.0", port=int(os.getenv("PORT", 10000)))
