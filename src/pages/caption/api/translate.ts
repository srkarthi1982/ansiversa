import type { APIRoute } from "astro";

const translations: Record<string, string> = {
  es: "Versión en español lista para publicar.",
  de: "Deutsche Version bereit zum Posten.",
  ar: "إصدار عربي جاهز للنشر.",
  hi: "पोस्ट करने के लिए हिन्दी संस्करण तैयार है।",
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const languages: string[] = Array.isArray(body?.to) ? body.to : ["es"];
  const text = typeof body?.text === "string" ? body.text : "";

  const localized = languages.map((lang) => ({
    lang,
    text: `${translations[lang] ?? text} ${body?.keepTone ? "(tone preserved)" : ""}`.trim(),
  }));

  return new Response(
    JSON.stringify({ localized }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};
