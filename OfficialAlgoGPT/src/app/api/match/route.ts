import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const { query, problems } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const prompt = `
      Available LeetCode Problems:
      ${problems.map((p: any) => `${p.number}. ${p.title} (${p.difficulty}): ${p.description} Tags: ${p.tags}`).join("\n")}

      User Query: "${query}"
      
      Which problem number (just the number) best matches this query?
      Consider problem descriptions, titles, and tags.
      Return ONLY the number.

      **If you cannot find a match or the user query is not specific enough, return 0.**
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that matches user queries to LeetCode problems. Return ONLY the problem number."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content || "0";
    const match = content.match(/\d+/);
    const problemNumber = match ? parseInt(match[0], 10) : 0;

    return NextResponse.json({ problemNumber });

  } catch (error) {
    console.error("Error matching question:", error);
    return NextResponse.json({ error: "Failed to match question" }, { status: 500 });
  }
}


