import { createParser, EventSourceMessage } from "eventsource-parser";
export type ChatGPTAgent = "user" | "system";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

export interface OpenAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

export async function FlaskStream(problemNumber: string | number) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch("http://127.0.0.1:5000/get_solution", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemNumber }),
  });

  const stream = new ReadableStream({
    async start(controller) {
      if (!res.body) {
        throw new Error("No response body");
      }
      const reader = res.body.getReader();

      try {
        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            controller.enqueue(encoder.encode(decoder.decode(value)));
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}

export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let counter = 0;
  let isCodeBlock = false; // ✅ Track if inside a code block

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const stream = new ReadableStream({
    async start(controller) {
      const parser = createParser({
        onEvent(event: EventSourceMessage) {
          if (event.data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(event.data);
            let text = json.choices?.[0]?.delta?.content || "";

            // ✅ Detect code blocks & format correctly
            if (text.includes("```")) {
              isCodeBlock = !isCodeBlock; // Toggle code block state
            }

            if (isCodeBlock) {
              text = text.replace(/\n/g, "\n"); // Ensure new lines inside code blocks
            }

            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }

            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            controller.error(e);
          }
        },
        onRetry(retryInterval) {
          console.log(`Server requested retry interval of ${retryInterval}ms`);
        },
        onError(error) {
          console.error("Error parsing event:", error);
        },
      });

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }

      parser.reset({ consume: true });
    },
  });

  return stream;
}
