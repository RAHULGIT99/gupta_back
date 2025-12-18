const axios = require("axios");
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const query = "Explain the importance of cybersecurity in 3 bullet points.";

const url = "https://api.groq.com/openai/v1/chat/completions";

const headers = {
    "Authorization": `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json"
};

const payload = {
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": query}
    ],
    "temperature": 0.7
};

async function run_request() {
    try {
        const response = await axios.post(url, payload, { headers });
        if (response.status === 200) {
            console.log(response.data.choices[0].message.content.trim());
        } else {
            console.log(`Error: ${response.status}`);
        }
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

run_request();