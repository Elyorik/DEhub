import os
import threading
import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from telegram import Update, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo, Bot
from telegram.ext import Application, CommandHandler, ContextTypes
from flask import Flask, request
from dotenv import load_dotenv

# -------------------- Load env --------------------
load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

# -------------------- Flask --------------------
flask_app = Flask(__name__)

@flask_app.route("/")
def home():
    return "✅ Telegram Bot läuft erfolgreich auf Render!"

# -------------------- News sources --------------------
NEWS_SITES = [
    {"type": "rss", "url": "https://www.tagesschau.de/xml/rss2"},
    {"type": "rss", "url": "https://rss.dw.com/xml/rss-de-all"},
    {"type": "html", "url": "https://www.zdf.de/nachrichten/heute"},
    {"type": "rss", "url": "https://www.n-tv.de/rss"},
    {"type": "rss", "url": "https://www.stern.de/feed/"},
    {"type": "rss", "url": "https://www.focus.de/rss/"},
]

USER_INDEX = {}

# -------------------- Telegram handlers --------------------
async def starten(update: Update, context: ContextTypes.DEFAULT_TYPE):
    webapp_button = KeyboardButton(
        text="🚀 WebApp öffnen",
        web_app=WebAppInfo(url="https://dehub-webapp.vercel.app")
    )

    reply_markup = ReplyKeyboardMarkup([[webapp_button]], resize_keyboard=True)
    await update.message.reply_text(
        "👋 Hallo!\n"
        "Klicke unten, um die WebApp zu öffnen.\n\n"
        "Schreib /neuigkeiten, um die neuesten Nachrichten zu sehen 🗞️",
        reply_markup=reply_markup
    )

def parse_rss(url):
    try:
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        root = ET.fromstring(r.content)
        item = root.find("./channel/item")
        if not item:
            return None
        title = item.find("title").text
        link = item.find("link").text
        description = item.find("description").text
        enclosure = item.find("enclosure")
        image_url = enclosure.attrib["url"] if enclosure is not None else None
        return {"title": title, "summary": description, "link": link, "image": image_url}
    except Exception:
        return None

def parse_zdf_heute(url):
    try:
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        article = soup.find("article")
        if not article:
            return None
        title_tag = article.find("h2")
        title = title_tag.get_text(strip=True) if title_tag else "ZDF Heute"
        summary_tag = article.find("p")
        summary = summary_tag.get_text(strip=True) if summary_tag else ""
        img_tag = article.find("img")
        image_url = img_tag["src"] if img_tag and "src" in img_tag.attrs else None
        link_tag = article.find("a", href=True)
        link = "https://www.zdf.de" + link_tag["href"] if link_tag else url
        return {"title": title, "summary": summary, "link": link, "image": image_url}
    except Exception:
        return None

def get_next_news(user_id):
    index = USER_INDEX.get(user_id, 0)
    site = NEWS_SITES[index % len(NEWS_SITES)]
    USER_INDEX[user_id] = index + 1

    if site["type"] == "rss":
        return parse_rss(site["url"])
    elif site["type"] == "html" and "zdf" in site["url"]:
        return parse_zdf_heute(site["url"])
    return None

async def neuigkeiten(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.message.chat_id
    news_item = get_next_news(user_id)

    if not news_item:
        await update.message.reply_text("❌ Keine Nachrichten verfügbar.")
        return

    caption = f"**{news_item['title']}**\n\n{news_item['summary']}\n\n🔗 Quelle: {news_item['link']}"

    if news_item["image"]:
        await update.message.reply_photo(
            photo=news_item["image"],
            caption=caption,
            parse_mode="Markdown"
        )
    else:
        await update.message.reply_text(caption, parse_mode="Markdown")

# -------------------- Telegram + Webhook --------------------
bot = Bot(BOT_TOKEN)
application = Application.builder().token(BOT_TOKEN).build()

application.add_handler(CommandHandler("starten", starten))
application.add_handler(CommandHandler("neuigkeiten", neuigkeiten))

@flask_app.post(f"/{BOT_TOKEN}")
def webhook():
    data = request.get_json()
    update = Update.de_json(data, bot)
    application.update_queue.put(update)
    return "ok"

async def setup_webhook():
    url = f"https://dehub.onrender.com/{BOT_TOKEN}"
    await bot.set_webhook(url)
    print(f"✅ Webhook gesetzt: {url}")

# -------------------- Main --------------------
if __name__ == "__main__":
    import asyncio
    asyncio.run(setup_webhook())
    flask_app.run(host="0.0.0.0", port=int(os.getenv("PORT", 10000)))
