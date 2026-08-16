async function sendTelegramMessage(message, keyboard = null) {

    const token =
        process.env.TELEGRAM_BOT_TOKEN;

    const chatId =
        process.env.TELEGRAM_CHAT_ID;

    const url =
        `https://api.telegram.org/bot${token}/sendMessage`;

    const body = {
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
    };

    if (keyboard) {
        body.reply_markup = {
            inline_keyboard: keyboard
        };
    }

    const response = await fetch(url, {
        method: "POST",

        headers: {
            "Content-Type":
                "application/json"
        },

        body: JSON.stringify(body)
    });

    return response.json();
}

module.exports = {
    sendTelegramMessage
};