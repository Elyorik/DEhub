import os
import threading
import asyncio
from flask import Flask, request
from telegram import Update, Bot, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
from dotenv import load_dotenv
import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

# Load env
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise Exception("❌ BOT_TOKEN не найден. Установи в Environment Variables на Render!")

RENDER_URL = os.getenv("RENDER_URL")
if not RENDER_URL:
    raise Exception("❌ RENDER_URL не найден. Установи в Environment Variables на Render!")

PORT = int(os.getenv("PORT", 10000))
WEBHOOK_URL = f"{RENDER_URL}/{BOT_TOKEN}"

# Flask app
app = Flask(__name__)

# Telegram application
application = Application.builder().token(BOT_TOKEN).build()
bot = Bot(BOT_TOKEN)

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

def parse_rss(url):
    try:
        r = requests.get(url, timeout=6)
        r.raise_for_status()
        root = ET.fromstring(r.content)
        item = root.find("./channel/item")
        if not item:
            return None
        title = item.find("title").text if item.find("title") is not None else ""
        link = item.find("link").text if item.find("link") is not None else ""
        description = item.find("description").text if item.find("description") is not None else ""
        enclosure = item.find("enclosure")
        image_url = enclosure.attrib.get("url") if enclosure is not None and "url" in enclosure.attrib else None
        return {"title": title, "summary": description, "link": link, "image": image_url}
    except Exception:
        return None

def parse_zdf(url):
    try:
        r = requests.get(url, timeout=6)
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

def get_news(user_id):
    idx = USER_INDEX.get(user_id, 0)
    site = NEWS_SITES[idx % len(NEWS_SITES)]
    USER_INDEX[user_id] = idx + 1
    if site["type"] == "rss":
        return parse_rss(site["url"])
    elif site["type"] == "html" and "zdf" in site["url"]:
        return parse_zdf(site["url"])
    return None

# ---------------- TELEGRAM HANDLERS ----------------

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
    if news.get("image"):
        await update.message.reply_photo(news["image"], caption=caption, parse_mode="Markdown")
    else:
        await update.message.reply_text(caption, parse_mode="Markdown")

application.add_handler(CommandHandler("starten", starten))
application.add_handler(CommandHandler("neuigkeiten", neuigkeiten))

# ---------------- WEBHOOK ROUTE ----------------
# Use async processing if Flask supports it; otherwise schedule on background loop.
# We'll schedule processing onto the background asyncio loop (see below).

@app.post(f"/{BOT_TOKEN}")
def receive_update():
    """Receive incoming Telegram update (webhook) and schedule processing in PTB application loop."""
    try:
        data = request.get_json(force=True)
    except Exception:
        return "bad request", 400

    update = Update.de_json(data, bot)
    # schedule processing on the bot loop (fire-and-forget)
    _ = asyncio.run_coroutine_threadsafe(application.process_update(update), bg_loop)
    return "ok"

@app.get("/")
def home():
    return "✅ Bot running"

# ---------------- Background asyncio loop & startup ----------------

def start_background_loop(loop):
    """Run the provided event loop forever (in a separate thread)."""
    asyncio.set_event_loop(loop)
    loop.run_forever()

# Create a new loop for the telegram Application tasks
bg_loop = asyncio.new_event_loop()
loop_thread = threading.Thread(target=start_background_loop, args=(bg_loop,), daemon=True)
loop_thread.start()

# Schedule initialization/startup of the PTB application in the background loop
# We wait for initialize() and webhook setup to finish before starting Flask, but we do not block processing.
init_future = asyncio.run_coroutine_threadsafe(application.initialize(), bg_loop)
init_future.result(timeout=30)  # wait until initialized (raises if problems)

# set webhook (must be awaited)
set_web_future = asyncio.run_coroutine_threadsafe(bot.delete_webhook(), bg_loop)
set_web_future.result(timeout=15)
set_web_future = asyncio.run_coroutine_threadsafe(bot.set_webhook(WEBHOOK_URL), bg_loop)
set_web_future.result(timeout=15)

# start application (background)
start_future = asyncio.run_coroutine_threadsafe(application.start(), bg_loop)
# don't .result() here — keep it running in background

print("✅ Telegram Application initialized and started in background loop")
print("✅ Webhook set to:", WEBHOOK_URL)

# ---------------- Run Flask (main thread) ----------------
if __name__ == "__main__":
    # on Render we want Flask to be main blocking process
    app.run(host="0.0.0.0", port=PORT)
