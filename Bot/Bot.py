from telegram import Update, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

# Replace with your bot token from BotFather
BOT_TOKEN = "8470338364:AAFY_NrHPpamEQgsfBOHc_uqWqi61RXSHus"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Create a button that opens your React app (running locally or hosted)
    webapp_button = KeyboardButton(
        text="🚀 Open WebApp",
        web_app=WebAppInfo(url="https://2e2f88adcd86.ngrok-free.app")  # React app link
    )

    # Send message with button
    reply_markup = ReplyKeyboardMarkup(
        [[webapp_button]], resize_keyboard=True
    )

    await update.message.reply_text(
        "Hallo 👋! Click below to open the WebApp:",
        reply_markup=reply_markup
    )

def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))

    print("Bot is running...")
    app.run_polling()

if __name__ == "__main__":
    main()
