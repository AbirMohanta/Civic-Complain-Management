const MISTRAL_API_KEY = "FjhTkQDRrrTgKK4vhJsqf3wqNjoRMpxJ";
const API_URL = "https://api.mistral.ai/v1/chat/completions";

export async function analyzeComplaintUrgency(
  description: string,
): Promise<number> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-tiny",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that analyzes civic complaints and assigns an urgency score from 0 to 1, where 1 is most urgent.",
          },
          {
            role: "user",
            content: `Please analyze this civic complaint and return only a number between 0 and 1 representing its urgency: "${description}"`,
          },
        ],
      }),
    });

    const data = await response.json();
    const score = parseFloat(data.choices[0].message.content);
    return isNaN(score) ? 0.5 : score;
  } catch (error) {
    console.error("Error analyzing complaint:", error);
    return 0.5;
  }
}
