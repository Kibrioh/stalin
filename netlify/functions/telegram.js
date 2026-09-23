async function sendTelegramMessage(
    message,
    keyboard = null,
    botToken,
    chatId
) {

    if (!botToken || !chatId) {
        throw new Error(
            "Telegram bot configuration is missing."
        );
    }

    const url =
        `https://api.telegram.org/bot${botToken}/sendMessage`;

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

    const result = await response.json();

    if (!response.ok || !result.ok) {
        console.error(
            "Telegram API error:",
            result
        );

        throw new Error(
            "Failed to send Telegram notification."
        );
    }

    return result;
}

module.exports = {
    sendTelegramMessage
};
