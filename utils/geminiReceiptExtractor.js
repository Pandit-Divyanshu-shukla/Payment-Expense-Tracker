const fs = require("fs/promises");
const categories = require("./categories");

function parseJsonResponse(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw err;
    }

    return JSON.parse(jsonMatch[0]);
  }
}

function sanitizeReceiptData(data) {
  const amount = Number(data.amount);
  const category = categories.includes(data.category) ? data.category : "Other";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(data.date || "")
    ? data.date
    : new Date().toISOString().split("T")[0];

  return {
    amount: Number.isFinite(amount) && amount > 0 ? amount : "",
    date,
    category,
    description: data.description || data.merchantName || "Receipt expense",
    merchantName: data.merchantName || "",
    confidence: Number(data.confidence) || 0,
    rawAiResponse: data
  };
}

async function extractReceiptWithGemini(filePath, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const imageBuffer = await fs.readFile(filePath);
  const imageBase64 = imageBuffer.toString("base64");
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `
You are an expense extraction assistant for a personal expense tracker.
Analyze this receipt image and return only valid JSON with these fields:
{
  "amount": number,
  "date": "YYYY-MM-DD",
  "category": one of ${JSON.stringify(categories)},
  "description": "short human readable expense description",
  "merchantName": "merchant or store name if visible",
  "confidence": number between 0 and 1
}

Rules:
- Use the final payable amount, grand total, total paid, or amount due.
- If the date is unclear, use today's date.
- Choose the best category from the provided category list.
- Do not include markdown or explanation.
`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  const responseBody = await response.json();

  if (!response.ok) {
    const message = responseBody.error?.message || "Gemini receipt extraction failed";
    throw new Error(message);
  }

  const text = responseBody.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini did not return receipt details");
  }

  return sanitizeReceiptData(parseJsonResponse(text));
}

module.exports = {
  extractReceiptWithGemini
};
