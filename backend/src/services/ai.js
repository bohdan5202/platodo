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

async function assignPlannedDate(task, existingSchedule) {
    const today = new Date().toISOString().split('T')[0];
    const deadline = task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : null;

    // Build a summary of how many tasks are planned per day
    const loadMap = {};
    for (const t of existingSchedule) {
        if (t.planned_date) {
            const day = new Date(t.planned_date).toISOString().split('T')[0];
            loadMap[day] = (loadMap[day] || 0) + 1;
        }
    }

    const response = await client.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You are a smart student planner assistant.
Today is ${today}.
The student has a new task to schedule. Pick the best day to work on it before its deadline.
Rules:
- The date must be between today (${today}) and the deadline (${deadline || 'no deadline, use week'}).
- Prefer days with fewer tasks already planned (lighter load).
- If the deadline is today or null, return today's date.
- Return ONLY a single ISO8601 date string (YYYY-MM-DD). No explanation, no extra text.`
            },
            {
                role: 'user',
                content: JSON.stringify({ task: { title: task.title, priority: task.priority, deadline }, dailyLoad: loadMap })
            }
        ],
        max_tokens: 20
    });

    const dateStr = response.choices[0].message.content.trim();
    // Validate that the response is a proper date
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return new Date(); // fallback to today
    return parsed;
}

module.exports = { parseTask, generateBriefing, replanConflict, assignPlannedDate };
