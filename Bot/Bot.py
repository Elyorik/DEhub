import os
from flask import Flask, request
from telegram import Update, Bot, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
from dotenv import load_dotenv
import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise Exception("❌ BOT_TOKEN не найден")

RENDER_URL = os.getenv("RENDER_URL")
if not RENDER_URL:
    raise Exception("❌ RENDER_URL не найден")

WEBHOOK_URL = f"{RENDER_URL}/{BOT_TOKEN}"

app = Flask(__name__)
application = Application.builder().token(BOT_TOKEN).build()
bot = Bot(BOT_TOKEN)

# ======= ТВОЙ КОД НОВОСТЕЙ ✅ =======

NEWS_SITES = [
    {"type": "rss", "url": "https://www.tagesschau.de/xml/rss2"},
    {"type": "rss", "url": "https://rss.dw.com/xml/rss-de-all"},
    {"type": "html", "url": "https://www.zdf.de/nachrichten/heute"},
    {"type": "rss", "url": "https://www.n-tv.de/rss"},
    {"type": "rss", "url": "https://www.stern.de/feed/"},
    {"type": "rss", "url": "https://www.focus.de/rss/"},
]

USER_INDEX = {}

def parse_rss(url):
    try:
        r = requests.get(url, timeout=5)
        root = ET.fromstring(r.content)
        item = root.find("./channel/item")
        if not item:
            return None
        return {
            "title": item.find("title").text,
            "summary": item.find("description").text,
            "link": item.find("link").text,
            "image": item.find("enclosure").attrib["url"]
            if item.find("enclosure") is not None else None
        }
    except:
        return None

def parse_zdf(url):
    try:
        r = requests.get(url, timeout=5)
        soup = BeautifulSoup(r.text, "html.parser")
        article = soup.find("article")
        title = article.find("h2").get_text(strip=True)
        summary = article.find("p").get_text(strip=True)
        link = "https://www.zdf.de" + article.find("a")["href"]
        img = article.find("img")
        image = img["src"] if img else None
        return {"title": title, "summary": summary, "link": link, "image": image}
    except:
        return None

def get_news(user_id):
    idx = USER_INDEX.get(user_id, 0)
    site = NEWS_SITES[idx % len(NEWS_SITES)]
    USER_INDEX[user_id] = idx + 1
    if site["type"] == "rss":
        return parse_rss(site["url"])
    if "zdf" in site["url"]:
        return parse_zdf(site["url"])

# ======= TELEGRAM COMMANDS ✅ =======

async def starten(update: Update, context: ContextTypes.DEFAULT_TYPE):
    btn = KeyboardButton(
        text="🚀 WebApp öffnen",
        web_app=WebAppInfo(url="https://dehub-webapp.vercel.app")
    )
    keyboard = ReplyKeyboardMarkup([[btn]], resize_keyboard=True)

    await update.message.reply_text(
        "👋 Hallo!\nKlicke unten, um die WebApp zu öffnen.\n\nSchreib /neuigkeiten",
        reply_markup=keyboard
    )

async def neuigkeiten(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_chat.id
    news = get_news(user)

    if not news:
        await update.message.reply_text("❌ Keine Nachrichten verfügbar.")
        return

    caption = f"**{news['title']}**\n\n{news['summary']}\n\n🔗 {news['link']}"

    if news["image"]:
        await update.message.reply_photo(news["image"], caption=caption, parse_mode="Markdown")
    else:
        await update.message.reply_text(caption, parse_mode="Markdown")

# Register handlers
application.add_handler(CommandHandler("starten", starten))
application.add_handler(CommandHandler("neuigkeiten", neuigkeiten))


# ======= WEBHOOK / POLLING SYSTEM ✅ =======

@app.post(f"/{BOT_TOKEN}")
def receive_update():
    update = Update.de_json(request.get_json(force=True), bot)
    application.update_queue.put(update)
    return "ok"

@app.get("/")
def home():
    return "✅ Bot running"

async def setup_webhook():
    await bot.delete_webhook()
    await bot.set_webhook(WEBHOOK_URL)

if "localhost" in RENDER_URL:
    print("✅ Local mode — polling")
    application.run_polling()
else:
    if __name__ == "__main__":
        import asyncio
        asyncio.run(setup_webhook())
        print(f"✅ Webhook: {WEBHOOK_URL}")
        app.run(host="0.0.0.0", port=int(os.getenv("PORT", 10000)))
