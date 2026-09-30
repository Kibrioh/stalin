const supabase = require("./supabase");

/*
 * Telegram configuration for each processor.
 */
const telegramConfigs = {
    l1: {
        botToken: process.env.L1_BOT_TOKEN,
        chatId: process.env.L1_CHAT_ID
    },

    l2: {
        botToken: process.env.L2_BOT_TOKEN,
        chatId: process.env.L2_CHAT_ID
    },

    l3: {
        botToken: process.env.L3_BOT_TOKEN,
        chatId: process.env.L3_CHAT_ID
    },

    l4: {
        botToken: process.env.L4_BOT_TOKEN,
        chatId: process.env.L4_CHAT_ID
    },

    l5: {
        botToken: process.env.L5_BOT_TOKEN,
        chatId: process.env.L5_CHAT_ID
    },

    l6: {
        botToken: process.env.L6_BOT_TOKEN,
        chatId: process.env.L6_CHAT_ID
    },

    l7: {
        botToken: process.env.L7_BOT_TOKEN,
        chatId: process.env.L7_CHAT_ID
    },

    l8: {
        botToken: process.env.L8_BOT_TOKEN,
        chatId: process.env.L8_CHAT_ID
    },

    l9: {
        botToken: process.env.L9_BOT_TOKEN,
        chatId: process.env.L9_CHAT_ID
    },

    l10: {
        botToken: process.env.L10_BOT_TOKEN,
        chatId: process.env.L10_CHAT_ID
    },

    l11: {
        botToken: process.env.L11_BOT_TOKEN,
        chatId: process.env.L11_CHAT_ID
    },

    l12: {
        botToken: process.env.L12_BOT_TOKEN,
        chatId: process.env.L12_CHAT_ID
    },

    l13: {
        botToken: process.env.L13_BOT_TOKEN,
        chatId: process.env.L13_CHAT_ID
    },

    l14: {
        botToken: process.env.L14_BOT_TOKEN,
        chatId: process.env.L14_CHAT_ID
    }
};


exports.handler = async (event) => {

    /*
     * Telegram sends webhook updates using POST.
     */
    if (event.httpMethod !== "POST") {

        return {
            statusCode: 405,

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                error: "Method not allowed"
            })
        };
    }


    try {

        /*
         * Get processor from:
         *
         * /api/telegram-webhook?processor=l1
         */
        const processor = String(
            event.queryStringParameters?.processor || ""
        )
            .toLowerCase()
            .trim();


        /*
         * Make sure this is one of L1-L14.
         */
        const telegramConfig =
            telegramConfigs[processor];


        if (
            !telegramConfig ||
            !telegramConfig.botToken
        ) {

            return {
                statusCode: 400,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    error:
                        "Invalid or missing processor."
                })
            };
        }


        /*
         * Parse Telegram update.
         */
        const update =
            JSON.parse(event.body || "{}");


        /*
         * We only need callback_query updates
         * for the approval buttons.
         */
        const callbackQuery =
            update.callback_query;


        if (!callbackQuery) {

            return {
                statusCode: 200,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    success: true,
                    message:
                        "Telegram update received."
                })
            };
        }


        /*
         * Example:
         *
         * approve:LN-2026-123456
         * reject:LN-2026-123456
         * review:LN-2026-123456
         * more_info:LN-2026-123456
         */
        const callbackData =
            String(
                callbackQuery.data || ""
            ).trim();


        const separatorIndex =
            callbackData.indexOf(":");


        if (separatorIndex === -1) {

            return {
                statusCode: 400,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    error:
                        "Invalid callback data."
                })
            };
        }


        /*
         * Separate action and application number.
         */
        const action =
            callbackData
                .substring(
                    0,
                    separatorIndex
                )
                .toLowerCase()
                .trim();


        const applicationNumber =
            callbackData
                .substring(
                    separatorIndex + 1
                )
                .trim();


        if (!applicationNumber) {

            return {
                statusCode: 400,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    error:
                        "Application number is missing."
                })
            };
        }


        /*
         * Map Telegram buttons to
         * Supabase application statuses.
         */
        const statusMap = {

            review:
                "UNDER_REVIEW",

            approve:
                "APPROVED",

            reject:
                "REJECTED",

            more_info:
                "MORE_INFORMATION_REQUIRED"
        };


        const newStatus =
            statusMap[action];


        if (!newStatus) {

            return {
                statusCode: 400,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    error:
                        "Unknown Telegram action."
                })
            };
        }


        console.log(
            `Telegram ${processor}: ${action} → ${applicationNumber}`
        );


        /*
         * Update the application.
         */
        const {
            data,
            error
        } = await supabase

            .from("loan_applications")

            .update({
                status: newStatus
            })

            .eq(
                "application_number",
                applicationNumber
            )

            .select(
                "application_number, status"
            )

            .single();


        if (error) {

            console.error(
                "SUPABASE TELEGRAM UPDATE ERROR:",
                error
            );

            return {
                statusCode: 500,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    error:
                        "Could not update application."
                })
            };
        }


        if (!data) {

            return {
                statusCode: 404,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    error:
                        "Application not found."
                })
            };
        }


        console.log(
            `Application ${applicationNumber} updated to ${newStatus}`
        );


        /*
         * Acknowledge the Telegram button click.
         *
         * IMPORTANT:
         * Use the token belonging to the
         * processor that received the callback.
         */
        const telegramResponse =
            await fetch(
                `https://api.telegram.org/bot${telegramConfig.botToken}/answerCallbackQuery`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        callback_query_id:
                            callbackQuery.id,

                        text:
                            `Application ${newStatus
                                .toLowerCase()
                                .replaceAll(
                                    "_",
                                    " "
                                )}`,

                        show_alert: false
                    })
                }
            );


        const telegramResult =
            await telegramResponse.json();


        if (!telegramResponse.ok) {

            console.error(
                "Telegram callback acknowledgement failed:",
                telegramResult
            );
        }


        /*
         * Return successful response.
         */
        return {
            statusCode: 200,

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                success: true,

                processor:
                    processor,

                application_number:
                    data.application_number,

                status:
                    data.status
            })
        };


    } catch (error) {

        console.error(
            "TELEGRAM WEBHOOK ERROR:",
            error
        );


        return {
            statusCode: 500,

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                error:
                    "Telegram webhook processing failed."
            })
        };
    }
};