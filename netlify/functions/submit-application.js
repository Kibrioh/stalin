const supabase = require("./supabase");

const {
    sendTelegramMessage
} = require("./telegram");


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

        // ---------------------------------------
        // VALIDATION
        // ---------------------------------------

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
                        error: `${field} is required`
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


        // ---------------------------------------
        // APPLICATION NUMBER
        // ---------------------------------------

        const applicationNumber =
            `LN-${new Date().getFullYear()}-${Date.now()}`;


        // ---------------------------------------
        // CALCULATE MONTHLY PAYMENT
        // ---------------------------------------

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


        // ---------------------------------------
        // SAVE TO SUPABASE
        // ---------------------------------------

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


        // ---------------------------------------
        // SEND COMPLETE APPLICATION TO TELEGRAM
        // ---------------------------------------

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

        // ---------------------------------------
        // TELEGRAM BUTTONS
        // ---------------------------------------

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


        // ---------------------------------------
        // SEND TO TELEGRAM
        // ---------------------------------------
        console.log("Sending application to Telegram...");
        await sendTelegramMessage(
            telegramMessage,
            keyboard
        );
        console.log("Application submitted successfully.");

        // ---------------------------------------
        // RETURN TO WEBSITE
        // ---------------------------------------

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

        console.error(error);

        return {

            statusCode: 500,

            body: JSON.stringify({

                error:
                    "Something went wrong while processing the application."

            })
        };
    }
};