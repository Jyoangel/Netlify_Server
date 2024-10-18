// routes/paymentRoutes.js
const express = require("express");
const axios = require("axios");
const sha256 = require("sha256");
const uniqid = require("uniqid");

const router = express.Router();

// UAT environment
const MERCHANT_ID = "PGTESTPAYUAT";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX = 1;
const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const APP_BE_URL = "http://localhost:3000"; // our application

// Helper function to make request with retries
async function makeRequestWithRetry(config, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios(config);
            return response;
        } catch (error) {
            if (error.response && error.response.status === 429 && i < retries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

// Endpoint to initiate a payment
router.get("/pay", async (req, res) => {
    const amount = +req.query.amount;

    let userId = "MUID123";
    let merchantTransactionId = uniqid();

    let normalPayLoad = {
        merchantId: MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: userId,
        amount: amount * 100, // converting to paise
        redirectUrl: `${APP_BE_URL}/payment/validate/${merchantTransactionId}`,
        redirectMode: "REDIRECT",
        mobileNumber: "9999999999",
        paymentInstrument: {
            type: "PAY_PAGE",
        },
    };

    let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
    let base64EncodedPayload = bufferObj.toString("base64");

    let string = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
    let sha256_val = sha256(string);
    let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

    const config = {
        method: 'post',
        url: `${PHONE_PE_HOST_URL}/pg/v1/pay`,
        headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum,
            accept: "application/json",
        },
        data: {
            request: base64EncodedPayload,
        },
    };

    try {
        const response = await makeRequestWithRetry(config);
        console.log("response->", JSON.stringify(response.data));
        res.redirect(response.data.data.instrumentResponse.redirectInfo.url);
    } catch (error) {
        res.send(error);
    }
});

// Endpoint to check the status of payment
router.get("/payment/validate/:merchantTransactionId", async (req, res) => {
    const { merchantTransactionId } = req.params;

    if (merchantTransactionId) {
        let statusUrl = `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;

        let string = `/pg/v1/status/${MERCHANT_ID}/` + merchantTransactionId + SALT_KEY;
        let sha256_val = sha256(string);
        let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

        const config = {
            method: 'get',
            url: statusUrl,
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": xVerifyChecksum,
                "X-MERCHANT-ID": merchantTransactionId,
                accept: "application/json",
            },
        };

        try {
            const response = await makeRequestWithRetry(config);
            console.log("response->", response.data);
            if (response.data && response.data.code === "PAYMENT_SUCCESS") {
                res.send(response.data);
            } else {
                res.send("Payment not successful. Please try again.");
            }
        } catch (error) {
            res.send(error);
        }
    } else {
        res.send("Sorry!! Error");
    }
});

module.exports = router;


// routes/paymentRoutes.js
{/*const express = require("express");
const axios = require("axios");
const sha256 = require("sha256");
const uniqid = require("uniqid");

const router = express.Router();

// UAT environment
const MERCHANT_ID = "PGTESTPAYUAT";
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const SALT_INDEX = 1;
const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const APP_BE_URL = "http://localhost:3000"; // our application

// Helper function to make request with retries
async function makeRequestWithRetry(config, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios(config);
            return response;
        } catch (error) {
            if (error.response && error.response.status === 429 && i < retries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

// Endpoint to initiate a payment
router.get("/pay", async (req, res) => {
    const amount = +req.query.amount;

    let userId = "MUID123";
    let merchantTransactionId = uniqid();

    let normalPayLoad = {
        merchantId: MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: userId,
        amount: amount * 100, // converting to paise
        redirectUrl: `${APP_BE_URL}/payment/validate/${merchantTransactionId}`,
        redirectMode: "REDIRECT",
        mobileNumber: "9999999999",
        paymentInstrument: {
            type: "PAY_PAGE",
        },
    };

    let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
    let base64EncodedPayload = bufferObj.toString("base64");

    let string = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
    let sha256_val = sha256(string);
    let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

    try {
        const response = await axios.post(
            `${PHONE_PE_HOST_URL}/pg/v1/pay`,
            {
                request: base64EncodedPayload,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-VERIFY": xVerifyChecksum,
                    accept: "application/json",
                },
            }
        );
        
        console.log("response->", JSON.stringify(response.data));
        res.redirect(response.data.data.instrumentResponse.redirectInfo.url);
    } catch (error) {
        res.send(error);
    }
});

// Endpoint to check the status of payment
router.get("/payment/validate/:merchantTransactionId", async (req, res) => {
    const { merchantTransactionId } = req.params;

    if (merchantTransactionId) {
        let statusUrl = `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;

        let string = `/pg/v1/status/${MERCHANT_ID}/` + merchantTransactionId + SALT_KEY;
        let sha256_val = sha256(string);
        let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

        try {
            const response = await axios.get(statusUrl, {
                headers: {
                    "Content-Type": "application/json",
                    "X-VERIFY": xVerifyChecksum,
                    "X-MERCHANT-ID": merchantTransactionId,
                    accept: "application/json",
                },
            });
            console.log("response->", response.data);
            if (response.data && response.data.code === "PAYMENT_SUCCESS") {
                res.send(response.data);
            } else {
                res.send("Payment not successful. Please try again.");
            }
        } catch (error) {
            res.send(error);
        }
    } else {
        res.send("Sorry!! Error");
    }
});

module.exports = router;*/}
