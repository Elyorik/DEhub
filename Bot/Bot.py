import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from telegram import Update, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = "8470338364:AAFY_NrHPpamEQgsfBOHc_uqWqi61RXSHus"

# News-Sites mit Typ (rss/html) und optional RSS-Link
NEWS_SITES = [
    {"type": "rss", "url": "https://www.tagesschau.de/xml/rss2"},
    {"type": "rss", "url": "https://rss.dw.com/xml/rss-de-all"},
    {"type": "html", "url": "https://www.zdf.de/nachrichten/heute"},
    {"type": "rss", "url": "https://www.n-tv.de/rss"},
    {"type": "rss", "url": "https://www.stern.de/feed/"},
    {"type": "rss", "url": "https://www.focus.de/rss/"},
]

# Index für jeden Benutzer
USER_INDEX = {}  # user_id -> nächster Index

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    webapp_button = KeyboardButton(
        text="🚀 Open WebApp",
        web_app=WebAppInfo(url="https://dehub.vercel.app")
    )
    reply_markup = ReplyKeyboardMarkup([[webapp_button]], resize_keyboard=True)

    await update.message.reply_text(
        "Hallo 👋!\nKlicke unten, um die WebApp zu öffnen.\n\nSchreib /news um die neuesten Nachrichten zu bekommen 📢",
        reply_markup=reply_markup
    )

def parse_rss(url):
    """Parst RSS-Feed"""
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
        image_url = enclosure.attrib["url"] if enclosure else None
        return {"title": title, "summary": description, "link": link, "image": image_url}
    except:
        return None

def parse_zdf_heute(url):
    """Parser für ZDF heute HTML"""
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
    except:
        return None

def get_next_news(user_id):
    """Nächste News für Benutzer"""
    index = USER_INDEX.get(user_id, 0)
    site = NEWS_SITES[index % len(NEWS_SITES)]
    USER_INDEX[user_id] = index + 1  # Fortschritt speichern

    if site["type"] == "rss":
        return parse_rss(site["url"])
    elif site["type"] == "html" and "zdf" in site["url"]:
        return parse_zdf_heute(site["url"])
    else:
        return None

async def news(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.message.chat_id
    news_item = get_next_news(user_id)

    if not news_item:
        await update.message.reply_text("Keine Nachrichten verfügbar ❌")
        return

    if news_item["image"]:
        await update.message.reply_photo(
            photo=news_item["image"],
            caption=f"**{news_item['title']}**\n\n{news_item['summary']}\n\nQuelle: {news_item['link']}",
            parse_mode="Markdown"
        )
    else:
        await update.message.reply_text(
            f"**{news_item['title']}**\n\n{news_item['summary']}\n\nQuelle: {news_item['link']}",
            parse_mode="Markdown"
        )

def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("news", news))
    print("Bot is running...")
    app.run_polling()

if __name__ == "__main__":
    main()
