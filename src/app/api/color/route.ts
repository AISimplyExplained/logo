import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RequestBody {
  prompt?: string;
}

export const maxDuration = 60;

export async function POST(request: Request) {
  const { prompt } = (await request.json()) as RequestBody;

  if (!prompt) {
    return NextResponse.json(
      { error: "Please provide prompt." },
      { status: 400 }
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are system, which takes a prompt. and process the prompt and gives color are mentioned in those prompt in terms of string array.
                    If the prompt is 'There are three cars. Their color are red, green, blue', Then answer should be in this format. '["#FF0000", "#00FF00", "#0000FF"]'
                    There are not fixed length of the answer. Minimum should be 1`,
        },
        {
          role: "user",
          content: "This is the user prompt: " + prompt,
        },
      ],
      seed: 10000,
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 400 }
      );
    }

    const res = JSON.parse(content);

    return NextResponse.json({ message: "Hello God!", colors: res });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error." });
  }
}
