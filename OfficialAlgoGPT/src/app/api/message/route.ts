import ChatbotPrompt from "@/app/helpers/constants/chatbot-prompt";
import { ChatGPTMessage, OpenAIStream, OpenAIStreamPayload } from "@/lib/openai-stream";
import { MessageArraySchema } from "@/lib/validators/message";
import { AILeetCodeMatcher } from '@/lib/ai-matcher';

export async function POST(req: Request) {
    let body;

    try {
        body = await req.json();
        console.log("Received request body:", JSON.stringify(body.messages, null, 2)); // ✅ Log request body
    } catch (error) {
        return new Response("Invalid JSON", { status: 400 });
    }

    if (!body.messages || !Array.isArray(body.messages)) {
        console.error("Missing messages array:", body);
        return new Response("Missing messages array", { status: 400 });
    }

    console.log("Messages before parsing:", body.messages); // ✅ Log messages before parsing

    let parsedMessages;
    try {
        parsedMessages = MessageArraySchema.parse(body.messages);
    } catch (error) {
        console.error("Zod validation error:", error);
        return new Response(JSON.stringify(error), { status: 400 });
    }

    console.log("Parsed messages:", parsedMessages); // ✅ Log parsed messages

    const outboundMessages: ChatGPTMessage[] = parsedMessages.map((message) => ({
        role: message.isUserMessage ? "user" : "system",
        content: message.text,
    }));

    const systemMessage = await ChatbotPrompt(body.id, body.solution, body.desc);

    outboundMessages.unshift({
        role: "system",
        content: systemMessage,
    });

    console.log("Final outboundMessages sent to OpenAI:", JSON.stringify(outboundMessages, null, 2));


    const payload: OpenAIStreamPayload = {
        model: "gpt-3.5-turbo",
        messages: outboundMessages,
        temperature: 0.4,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 1000,
        stream: true,
        n: 1,
    };

    const stream = await OpenAIStream(payload);

    return new Response(stream);
}
