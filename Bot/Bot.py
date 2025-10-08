import os
import asyncio
from threading import Thread
from flask import Flask
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters
from dotenv import load_dotenv

# === Загрузка токена из .env ===
load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

# === Flask сервер для Render (чтобы сайт был 'alive') ===
app = Flask(__name__)

@app.route("/")
def home():
    return "✅ Bot is alive and running on Render!"

def run_flask():
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)

# === Telegram Bot ===
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("👋 Привет! Бот успешно запущен и готов к работе!")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("📖 Команды:\n/start — запустить бота\n/help — помощь")

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"Ты написал: {update.message.text}")

def run_bot():
    app_telegram = ApplicationBuilder().token(BOT_TOKEN).build()

    app_telegram.add_handler(CommandHandler("start", start))
    app_telegram.add_handler(CommandHandler("help", help_command))
    app_telegram.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

    print("🤖 Telegram Bot is running...")
    app_telegram.run_polling()

# === Запуск обоих процессов ===
if __name__ == "__main__":
    Thread(target=run_flask).start()  # запускаем Flask сервер в фоне
    run_bot()                         # запускаем Telegram-бота
