const axios = require("axios");
const EmailHistory = require("../models/emailHistory");
const mammoth = require("mammoth");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

// ─── GENERATE EMAIL ───────────────────────────────────────────
exports.generateEmail = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt required." });
  }

  try {
    const systemPrompt = `You are an expert job outreach strategist.
Your task is to generate a HIGH-CONVERTING cold email to a recruiter for a job opportunity.
Return ONLY valid JSON:
{
  "subject": "",
  "emailBody": "",
  "linkedInDM": "",
  "followUpEmail": ""
}
No markdown. No explanations. Only JSON.`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `${systemPrompt}\n\nUser REQUEST: "${prompt.trim()}"`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const generatedText = response.data.choices[0]?.message?.content;
    if (!generatedText) throw new Error("Invalid response from Groq API");

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : generatedText;

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonString);
    } catch {
      return res.status(500).json({ message: "AI did not return valid JSON", raw: generatedText });
    }

    const emailData = {
      subject: parsedResponse.subject || "New Opportunity",
      emailBody: parsedResponse.emailBody || "",
      linkedInDM: parsedResponse.linkedInDM || "",
      followUpEmail: parsedResponse.followUpEmail || "",
    };

    if (!emailData.subject || !emailData.emailBody) {
      return res.status(500).json({ message: "AI generated incomplete email. Try again." });
    }

    await EmailHistory.create({
      user: req.user._id,
      prompt: prompt.trim(),
      subject: emailData.subject,
      emailBody: emailData.emailBody,
      linkedInDM: emailData.linkedInDM,
      followUpEmail: emailData.followUpEmail,
    });

    return res.status(200).json({ message: "Email generated successfully", data: emailData });

  } catch (error) {
    console.error("❌ AI ERROR:", error.response?.data || error.message);
    if (error.response?.status === 429) {
      return res.status(429).json({ message: "Too many requests. Please wait." });
    }
    return res.status(500).json({
      message: "Failed to generate email",
      error: error.response?.data?.error?.message || error.message,
    });
  }
};

// ─── GENERATE FROM RESUME ─────────────────────────────────────
exports.generateFromResume = async (req, res) => {
  const { jobDescription, outputType } = req.body;

  if (!req.file)       return res.status(400).json({ message: "Resume file is required." });
  if (!jobDescription) return res.status(400).json({ message: "Job description is required." });
  if (!outputType)     return res.status(400).json({ message: "Output type is required." });

  try {
    let resumeText = "";
    const mime = req.file.mimetype;

    if (mime === "application/pdf") {
      // ── Extract text using pdfjs-dist ──
      const uint8Array = new Uint8Array(req.file.buffer);
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdfDoc = await loadingTask.promise;
      let text = "";
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }
      resumeText = text;

    } else if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      resumeText = result.value;

    } else {
      return res.status(400).json({ message: "Only PDF or DOCX files are supported." });
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ message: "Could not extract text from resume." });
    }

    const prompts = {
      coldEmail: `You are an expert job outreach strategist.
Given the candidate's resume and a job description, generate a HIGH-CONVERTING cold email to the recruiter.
Return ONLY valid JSON: { "subject": "", "output": "" }
Rules: Subject 6-9 words, Email 60-90 words, confident tone, no emojis, highlight matching skills, end with CTA.
RESUME:\n${resumeText.slice(0, 3000)}\nJOB DESCRIPTION:\n${jobDescription.slice(0, 2000)}`,

      linkedInDM: `You are an expert job outreach strategist.
Given the candidate's resume and a job description, generate a SHORT LinkedIn DM to the recruiter.
Return ONLY valid JSON: { "output": "" }
Rules: 30-50 words, conversational, mention 1-2 matching skills, soft ask.
RESUME:\n${resumeText.slice(0, 3000)}\nJOB DESCRIPTION:\n${jobDescription.slice(0, 2000)}`,

      tailoredResume: `You are an expert resume writer and ATS specialist.
Rewrite and tailor the candidate's resume to match the given job description as closely as possible.
Return ONLY valid JSON: { "output": "" }
Rules:
- Rewrite the summary/objective to align with the role
- Reorder and reword bullet points to highlight relevant experience
- Add missing keywords from the JD naturally into existing experience
- Keep the same structure: Summary, Experience, Skills, Education
- Do NOT invent fake experience or skills
- Output the full tailored resume as plain text inside "output"
RESUME:\n${resumeText.slice(0, 3000)}\nJOB DESCRIPTION:\n${jobDescription.slice(0, 2000)}`,
    };

    const selectedPrompt = prompts[outputType];
    if (!selectedPrompt) return res.status(400).json({ message: "Invalid output type." });

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: selectedPrompt }],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const generatedText = response.data.choices[0]?.message?.content;
    if (!generatedText) throw new Error("Empty response from Groq");

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : generatedText;

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      return res.status(500).json({ message: "AI returned invalid JSON.", raw: generatedText });
    }

    await EmailHistory.create({
      user: req.user._id,
      prompt: `[${outputType}] ${jobDescription.slice(0, 100)}`,
      subject: parsed.subject || outputType,
      emailBody: outputType === "coldEmail" ? parsed.output : "",
      linkedInDM: outputType === "linkedInDM" ? parsed.output : "",
      followUpEmail: outputType === "tailoredResume" ? parsed.output : "",
    });

    return res.status(200).json({
      message: "Generated successfully",
      outputType,
      subject: parsed.subject || null,
      output: parsed.output,
    });

  } catch (error) {
    console.error("❌ RESUME GENERATE ERROR:", error.message);
    return res.status(500).json({
      message: "Failed to generate output",
      error: error.message,
    });
  }
};

// ─── GET HISTORY ──────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const history = await EmailHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(history);
  } catch (error) {
    console.error("❌ HISTORY ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch history", error: error.message });
  }
};

// ─── CLEAR HISTORY ────────────────────────────────────────────
exports.clearHistory = async (req, res) => {
  try {
    await EmailHistory.deleteMany({ user: req.user._id });
    res.status(200).json({ message: "History cleared" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing history", error: error.message });
  }
};