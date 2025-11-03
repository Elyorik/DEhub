import os
from flask import Flask, request
from telegram import Update, Bot
from telegram.ext import Application, CommandHandler

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBHOOK_URL = f"https://YOUR_RENDER_URL.onrender.com/{BOT_TOKEN}"

app = Flask(__name__)

bot = Bot(BOT_TOKEN)
application = Application.builder().token(BOT_TOKEN).build()

async def start(update: Update, context):
    await update.message.reply_text("✅ Бот работает!")

application.add_handler(CommandHandler("start", start))


@app.post(f"/{BOT_TOKEN}")
def webhook():
    update = Update.de_json(request.get_json(force=True), bot)
    application.update_queue.put(update)
    return "ok"


@app.get("/")
def home():
    return "Bot running"


async def set_webhook():
    await bot.set_webhook(WEBHOOK_URL)


if __name__ == "__main__":
    import asyncio
    asyncio.run(set_webhook())
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 10000)))
