const { AzureOpenAI } = require('openai');

const client = new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_KEY,
    apiVersion: '2024-02-01',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT
});

async function parseTask(rawInput) {
    const today = new Date().toISOString().split('T')[0];
    const response = await client.chat.completions.create({
        messages: [
            {
                role: 'system', content: `You are a task parser for a student planner.
        Today is ${today}. Return ONLY valid JSON:
        {"title":string,"subject":string|null,"deadline":ISO8601|null,"priority":1-5}` },
            { role: 'user', content: rawInput }
        ],
        max_tokens: 150
    });
    return JSON.parse(response.choices[0].message.content);
}

async function generateBriefing(taskList) {
    const response = await client.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You are an AI assistant for a student planner. 
                Your task is to write a short, motivating morning briefing based on the user's tasks for today. 
                Keep it friendly, concise (max 2-3 sentences), and use emojis.`
            },
            { role: 'user', content: taskList }
        ],
        max_tokens: 200
    });
    return response.choices[0].message.content;
}
async function replanConflict(tasks, date) {
    const response = await client.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You are a strict but helpful time-management assistant. 
                The user has too many deadlines on ${date}. 
                Analyze the tasks and suggest a short strategy to survive this day (e.g., what to do first, what to postpone). 
                Keep the response under 3 sentences.`
            },
            { role: 'user', content: JSON.stringify(tasks) }
        ],
        max_tokens: 250
    });
    return response.choices[0].message.content;
}

module.exports = { parseTask, generateBriefing, replanConflict };
