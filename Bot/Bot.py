import os
import asyncio
from threading import Thread
from flask import Flask
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
from dotenv import load_dotenv

# === Загрузка токена ===
load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

# === Flask сервер для Render (аптайм) ===
app = Flask(__name__)

@app.route("/")
def home():
    return "✅ Bot is alive and running on Render!"

def run_flask():
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)

# === Telegram Bot ===
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("👋 Привет! Бот успешно запущен и работает!")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("📖 Команды:\n/start — запустить\n/help — помощь")

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"Ты написал: {update.message.text}")

async def main():
    application = Application.builder().token(BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

    print("🤖 Telegram Bot is running...")
    await application.run_polling()

# === Запуск Flask + Telegram ===
if __name__ == "__main__":
    Thread(target=run_flask).start()     # Flask сервер для Render
    asyncio.run(main())                  # Асинхронный запуск бота
