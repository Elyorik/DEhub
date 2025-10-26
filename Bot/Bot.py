import os
import logging
from flask import Flask, request
from dotenv import load_dotenv
from telegram import Update, Bot
from telegram.ext import Application, CommandHandler, ContextTypes

# === Настройки логов ===
logging.basicConfig(
    format="%(asctime)s [%(levelname)s]: %(message)s",
    level=logging.INFO
)

# === Загружаем .env ===
load_dotenv()

TOKEN = os.getenv("BOT_TOKEN") or "PASTE_YOUR_TOKEN_HERE"
WEBHOOK_URL = os.getenv("WEBHOOK_URL") or "https://dehub.onrender.com/webhook"

# === Flask ===
app = Flask(__name__)

# === Telegram bot ===
bot = Bot(token=TOKEN)
application = Application.builder().token(TOKEN).build()

# === Команды ===
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("👋 Hallo! Ich bin dein DEhub Bot.\nSchreibe /hilfe, um alle Befehle zu sehen.")

async def hilfe(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "📋 **Verfügbare Befehle:**\n"
        "/starten — den Bot starten\n"
        "/hilfe — Liste der Befehle\n"
        "/neuigkeiten — letzte Nachrichten\n"
        "/kontakt — Kontaktinformation\n"
    )
    await update.message.reply_text(text, parse_mode="Markdown")

async def neuigkeiten(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("📰 Aktuelle Nachrichten findest du hier: https://www.tagesschau.de")

async def kontakt(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("📧 Kontakt: info@dehub.de")

# === Регистрируем обработчики ===
application.add_handler(CommandHandler("start", start))
application.add_handler(CommandHandler("starten", start))
application.add_handler(CommandHandler("hilfe", hilfe))
application.add_handler(CommandHandler("neuigkeiten", neuigkeiten))
application.add_handler(CommandHandler("kontakt", kontakt))

# === Обработка ошибок ===
async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    logging.error(f"⚠️ Exception: {context.error}")
    if isinstance(update, Update) and update.effective_chat:
        try:
            await update.effective_chat.send_message("❌ Ein Fehler ist aufgetreten. Bitte versuche es später erneut.")
        except Exception as e:
            logging.error(f"⚠️ Fehler beim Senden der Fehlermeldung: {e}")

application.add_error_handler(error_handler)

# === Flask маршруты ===
@app.route("/", methods=["GET"])
def home():
    return "✅ Bot läuft auf Render!"

@app.route("/webhook", methods=["POST"])
async def webhook():
    try:
        update = Update.de_json(request.get_json(force=True), bot)
        await application.process_update(update)
    except Exception as e:
        logging.exception(f"❌ Fehler im Webhook: {e}")
        return "Error", 500
    return "OK", 200

# === Запуск ===
if __name__ == "__main__":
    logging.info("🚀 Starte Bot & Flask Server auf Render...")

    try:
        bot.delete_webhook()
        bot.set_webhook(url=WEBHOOK_URL)
        logging.info(f"✅ Webhook gesetzt: {WEBHOOK_URL}")
    except Exception as e:
        logging.error(f"❌ Fehler beim Setzen des Webhooks: {e}")

    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
