// server/server.js

require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors'); 
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001;

app.use(cors());


app.use(express.json());


// Initialize API Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});


// --- Endpoint to START the interview ---
app.post('/api/start-interview', async (req, res) => {
    try {
        const prompt = "You are an AI interviewer. Your name is Swaps. Start the interview by introducing yourself in one line and asking one common, opening behavioral question. Ask questions like a human being, do not make it look AI generated.";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const questionText = response.text().trim();

        res.json({ questionText });
    } catch (error) {
        console.error("Error in /start-interview:", error);
        res.status(500).json({ error: "Failed to start the interview." });
    }
});

// --- Endpoint to PROCESS an answer and get a follow-up ---
app.post('/api/process-answer', async (req, res) => {
    const { originalQuestion, userAnswer, conversationHistory } = req.body;

    if (!userAnswer) {
        return res.status(400).json({ error: "User answer cannot be empty." });
    }

    try {
        const history = conversationHistory.map(turn => ({
            role: turn.role,
            parts: [{ text: turn.text }]
        }));

        const chat = model.startChat({ history });

        const prompt = `
            The user was just asked: "${originalQuestion}".
            The user responded: "${userAnswer}".

            Your tasks are:
            1.  Critically evaluate the user's answer based on the STAR method (Situation, Task, Action, Result), even if it's not a perfect STAR-method question. Be a tough but fair interviewer.
            2.  Provide a score from 1 to 10 for their answer.
            3.  Provide brief, constructive feedback (1-2 sentences).
            4.  Based on their answer and the conversation history, ask one relevant, probing follow-up 1 liner question. Do not repeat questions.
            5.  If the user's answer is very short, off-topic, or nonsensical, point it out and gently guide them back on track with a relevant question.

            Return your entire response ONLY in a valid JSON object with the following structure:
            {
              "score": <integer>,
              "feedback": "<string>",
              "followUpQuestion": "<string>"
            }
        `;

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const responseText = response.text().trim();
        
        // Clean the response to ensure it's valid JSON
        const jsonString = responseText.match(/\{[\s\S]*\}/)[0];
        const parsedResponse = JSON.parse(jsonString);

        res.json(parsedResponse);

    } catch (error) {
        console.error("Error in /process-answer:", error);
        res.status(500).json({ error: "Failed to process the answer." });
    }
});


app.listen(port, () => {
    console.log(`✅ Backend server running at http://localhost:${port}`);
});
