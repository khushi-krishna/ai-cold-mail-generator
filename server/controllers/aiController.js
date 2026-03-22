const axios = require("axios");
const EmailHistory = require("../models/emailHistory");

exports.generateEmail = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt required." });
  }

  try {
    const systemPrompt = `You are an expert job outreach strategist.

Your task is to generate a HIGH-CONVERTING cold email to a recruiter for a job opportunity.

IMPORTANT:
- Even if the user gives only 2–4 words, assume realistic context.
- Do NOT ask for clarification.
- Make professional assumptions.
- Avoid generic phrases.
- Keep it concise and structured.

====================================================
OUTPUT FORMAT (STRICT)
====================================================

Return ONLY valid JSON:

{
  "subject": "",
  "emailBody": "",
  "linkedInDM": "",
  "followUpEmail": ""
}

No markdown.
No explanations.
Only JSON.

====================================================
CONTEXT ASSUMPTIONS
====================================================

Assume:
- Candidate has 2+ years experience
- Strong in DSA and system design
- Has worked on backend APIs or scalable systems
- Has contributed to production-level features
- Actively seeking Software Engineer roles

If prompt is short like:
"SDE role"
"Backend engineer"
"Startup job"
"Product company"

Create intelligent assumptions about:
- Scaling challenges
- Hiring urgency
- Performance or system reliability issues
- Team growth

====================================================
SUBJECT LINE RULES
====================================================

• 6–9 words
• Must sound confident
• No generic phrases like:
  - "Quick question"
  - "Looking for opportunity"
  - "Job application"
• Should highlight value or experience

Example styles:
"Backend engineer with 2+ yrs scaling APIs"
"Engineer focused on scalable system design"
"Software engineer improving system performance"

====================================================
EMAIL BODY STRUCTURE (STRICT)
====================================================

Keep 60–90 words.

Line 1: Personalized observation about hiring  
Line 2: Mention common hiring/scaling challenge  
Line 3-4: Candidate's experience and strengths  
Line 5: Specific impact or contribution  
Line 6: Clear CTA  
Line 7: Sign-off with name and title  

Tone:
• Confident
• Professional
• Not desperate
• No emojis
• No hype words

====================================================
LINKEDIN DM STRUCTURE
====================================================

30–50 words.
Short, conversational.
Observation + value + soft ask.

====================================================
FOLLOW-UP EMAIL STRUCTURE
====================================================

50–80 words.
New angle.
Emphasize long-term value.
Professional urgency.
Clear CTA.

====================================================

Return ONLY valid JSON.`;

    const fullPrompt = `${systemPrompt}

User REQUEST: "${prompt.trim()}"`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: fullPrompt }],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    // ✅ Validate response
    if (
      !response.data ||
      !response.data.choices ||
      !response.data.choices[0]?.message?.content
    ) {
      throw new Error("Invalid response from Groq API");
    }

    const generatedText = response.data.choices[0].message.content;

    // ✅ Extract JSON safely
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : generatedText;

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("❌ JSON parse error:", generatedText);

      return res.status(500).json({
        message: "AI did not return valid JSON",
        raw: generatedText,
      });
    }

    // ✅ Clean + fallback values
    const emailData = {
      subject: parsedResponse.subject || "New Opportunity",
      emailBody: parsedResponse.emailBody || "",
      linkedInDM: parsedResponse.linkedInDM || "",
      followUpEmail: parsedResponse.followUpEmail || "",
    };

    // ✅ Validate essential fields
    if (!emailData.subject || !emailData.emailBody) {
      return res.status(500).json({
        message: "AI generated incomplete email. Try again.",
      });
    }

    // ✅ Save to DB (FIXED)
    const historyEntry = await EmailHistory.create({
      user: req.user._id, // ⚠️ fixed field
      prompt: prompt.trim(),
      subject: emailData.subject,
      emailBody: emailData.emailBody,
      linkedInDM: emailData.linkedInDM,
      followUpEmail: emailData.followUpEmail,
    });

    return res.status(200).json({
      message: "Email generated successfully",
      data: emailData,
    });
  } catch (error) {
    console.error("❌ AI ERROR:", error.response?.data || error.message);

    if (error.response?.status === 429) {
      return res.status(429).json({
        message: "Too many requests. Please wait.",
        error: "Rate limit exceeded",
      });
    }

    return res.status(500).json({
      message: "Failed to generate email",
      error: error.response?.data?.error?.message || error.message,
    });
  }
};

// ================= HISTORY API =================

exports.getHistory = async (req, res) => {
  try {
    const history = await EmailHistory.find({ user: req.user._id }) // ⚠️ fixed field
      .sort({ createdAt: -1 });

    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch history",
    });
  }
};

exports.generateHistory = async (req, res) => {
  try {
    const history = await EmailHistory.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ history });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch history", error: error.message });
  }
};
