const supabase = require("./supabase");

const {
    sendTelegramMessage
} = require("./telegram");

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
                "NEW"
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
<b>🔔 NEW LOAN APPLICATION</b>

━━━━━━━━━━━━━━━━━━━━

<b>📋 APPLICATION</b>

Reference:
<b>${result.application_number}</b>

Status:
<b>NEW</b>


<b>👤 APPLICANT DETAILS</b>

Name:
${result.full_name}

Phone:
${result.phone}

National ID:
${result.national_id}


<b>💰 LOAN DETAILS</b>

Loan Amount:
<b>USD ${loanAmount.toLocaleString()}</b>

Repayment Period:
<b>${repaymentPeriod} months</b>

Monthly Payment:
<b>USD ${monthlyPayment.toFixed(2)}</b>


<b>💼 FINANCIAL INFORMATION</b>

Employment Status:
${result.employment_status}

Monthly Net Income:
<b>USD ${Number(
    result.monthly_income
).toLocaleString()}</b>


<b>📊 APPLICATION SUMMARY</b>

Requested:
USD ${loanAmount.toLocaleString()}

Interest Rate:
4.5% APR

Estimated Monthly Payment:
USD ${monthlyPayment.toFixed(2)}


━━━━━━━━━━━━━━━━━━━━

🕐 Application received:
${new Date().toLocaleString("en-KE")}

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