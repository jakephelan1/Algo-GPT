import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const { queries, problems } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const formattedQueries = queries
      .slice(0, queries.length - 1) 
      .map((query: any) => {
        if (query.isUserMessage) {
          return `Human: ${query.text}`;
        } else {
          return `AI: ${query.text}`;
        }
      })
      .join("\n");

    const currentQuery = `Human: ${queries[queries.length - 1].text}`;

    const helper = `
      You are a helpful assistant that matches user queries to LeetCode problems. 
      Available LeetCode Problems:
      ${problems.map((p: any) => `${p.number}. ${p.title} (${p.difficulty}) Tags: ${p.tags}`).join("\n")}

      Conversation History:
      ${formattedQueries}

      Which problem number best matches the user's query?
      - If no clear match exists, return 0.
      - Respond only with the number.
      `;

    console.log(`Matcher prompt: ${helper}`)
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: helper
        },
        {
          role: "user",
          content: currentQuery
        }
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content || "0";
    const match = content.match(/\d+/);
    const problemNumber = match ? parseInt(match[0], 10) : 0;

    console.log(problemNumber)

    return NextResponse.json({ problemNumber });

  } catch (error) {
    console.error("Error matching question:", error);
    return NextResponse.json({ error: "Failed to match question" }, { status: 500 });
  }
}
