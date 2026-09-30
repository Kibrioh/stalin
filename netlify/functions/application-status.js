const supabase = require("./supabase");

exports.handler = async (event) => {
    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                error: "Method not allowed"
            })
        };
    }

    try {
        const applicationNumber =
            event.queryStringParameters?.application_number;

        if (!applicationNumber) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "Application number is required."
                })
            };
        }

        const {
            data,
            error
        } = await supabase
            .from("loan_applications")
            .select(
                "application_number, status"
            )
            .eq(
                "application_number",
                applicationNumber
            )
            .single();

        if (error || !data) {
            console.error(
                "APPLICATION STATUS ERROR:",
                error
            );

            return {
                statusCode: 404,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "Application not found."
                })
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                application_number:
                    data.application_number,

                status:
                    data.status
            })
        };

    } catch (error) {

        console.error(
            "APPLICATION STATUS ERROR:",
            error
        );

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                error:
                    "Could not retrieve application status."
            })
        };
    }
};