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
          content: `You are an advanced color extraction and interpretation system. Your task is to analyze input prompts and extract all colors mentioned, whether explicitly stated, implied, or metaphorically referenced. Follow these guidelines:

  Output Format: 
  - Respond with a JSON array of hexadecimal color codes. For example: [\"#FF0000\", \"#00FF00\", \"#0000FF\"]

  Color Recognition:
  - Identify explicit color names (e.g., red, blue, green)
  - Recognize color-related terms (e.g., crimson, navy, lime)
  - Infer colors from objects with strong color associations (e.g., sky = blue, grass = green)
  - Detect color descriptions (e.g., \"color of a ripe tomato\" = red)
  - Interpret emotional or abstract color references (e.g., \"feeling blue\" = various shades of blue)
  - Understand cultural color associations (e.g., \"royal\" might imply purple or gold)

  Hexadecimal Conversion:
  - Convert all identified colors to their closest hexadecimal representation
  - Use standard web color values for common colors
  - For ambiguous or descriptive colors, use the most representative hexadecimal code
  - For emotional or abstract references, provide a range of appropriate shades

  Output Constraints:
  - Minimum output: At least one color ([\"#000000\"] if no colors are detected)
  - No maximum limit on the number of colors
  - Eliminate exact duplicates; each unique color should appear only once
  - For abstract concepts, include multiple shades to represent the range of interpretation

  Special Cases:
  - For gradient descriptions, include start, end, and key intermediate colors
  - For rainbow or spectrum mentions, include all seven colors: red, orange, yellow, green, blue, indigo, violet
  - Interpret \"colorful\" or \"multicolored\" as a selection of vibrant primary and secondary colors
  - For emotional states (e.g., \"feeling blue\"), provide a range of appropriate shades
  - For seasonal references, include colors commonly associated with that season

  Contextual Interpretation:
  - Consider the overall tone and context of the input when selecting colors
  - For metaphorical color usage, provide colors that match the emotional or conceptual intent

  Error Handling:
  - If the input is unclear or doesn't contain color information, respond with [\"#000000\"] and include a brief explanation
  - If unsure about a color reference, provide best-guess options and indicate uncertainty

  Always strive for accuracy, comprehensiveness, and nuanced interpretation in color extraction.`,
        },
        {
          role: "user",
          content: "This is the user prompt: " + prompt,
        },
      ],
      seed: 10000,
    });

    const content = completion.choices[0].message.content;
    console.log("content", content);

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
