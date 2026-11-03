import { createServerFn } from "@tanstack/react-start";

const MAX_IMAGE_CHARS = 8_000_000;

const INSTRUCTIONS = `You are a front-end engineer. Recreate the supplied screenshot as one self-contained HTML document.
Rules:
- Match layout, spacing, colors, typography, borders, radii and shadows as closely as possible.
- Use inline <style> CSS only. No external scripts, images or fonts except Google Fonts <link> if clearly needed.
- Replace photos/illustrations with neutral placeholder blocks or simple CSS shapes of the same size.
- Reproduce visible text verbatim.
- Output ONLY the HTML document, starting with <!DOCTYPE html>. No markdown fences, no commentary.`;

export const recreateScreenshot = createServerFn({ method: "POST" })
  .inputValidator((input: { image: string; notes?: string }) => {
    if (typeof input?.image !== "string" || !input.image.startsWith("data:image/"))
      throw new Error("Please upload a PNG, JPG or WebP screenshot.");
    if (input.image.length > MAX_IMAGE_CHARS) throw new Error("Screenshot is too large (max ~6 MB).");
    return { image: input.image, notes: (input.notes ?? "").slice(0, 1000) };
  })
  .handler(async ({ data }) => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: INSTRUCTIONS,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: data.notes ? `Extra notes: ${data.notes}` : "Recreate this screenshot." },
              { type: "input_image", image_url: data.image, detail: "high" },
            ],
          },
        ],
      });
      let text = "";
      for (const item of res.output ?? []) {
        if (item.type === "message")
          for (const c of item.content) if (c.type === "output_text") text += c.text;
      }
      const html = text.replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/, "").trim();
      if (!html) return { html: "", error: "The AI returned no layout. Try another screenshot." };
      return { html, error: null as string | null };
    } catch (e) {
      console.error(e);
      if (e instanceof GatewayError) {
        if (e.code === "payment_required" || e.httpStatus === 402)
          return { html: "", error: "AI credits are used up. Add credits and try again." };
        if (e.httpStatus === 429) return { html: "", error: "Too many requests — wait a moment and try again." };
      }
      return { html: "", error: "Couldn't analyze the screenshot. Please try again." };
    }
  });
