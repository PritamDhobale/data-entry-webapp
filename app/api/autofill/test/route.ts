import { NextResponse } from "next/server";

/* ------------------------------------------
   Helpers
-------------------------------------------*/

// Decode HTML entities
const decode = (str: string) =>
  str
    ?.replace(/&#8217;/g, "'")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "—");

// Extract JSON from schema
const extractSchema = (html: string) => {
  try {
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i
    );
    if (!match) return null;
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
};

// Clean US phone numbers
const cleanPhones = (phones: string[]) => {
  return phones
    .map((p) => p.replace(/[^\d+]/g, ""))
    .filter((p) => p.length >= 10 && p.length <= 14)
    .filter((v, i, a) => a.indexOf(v) === i);
};

// Clean emails
const cleanEmails = (emails: string[]) =>
  emails
    .map((e) => e.toLowerCase())
    .filter((e) => !e.includes(".png") && !e.includes(".jpg"))
    .filter((v, i, a) => a.indexOf(v) === i);

// Detect social URLs
const extractUrl = (html: string, pattern: RegExp) =>
  html.match(pattern)?.[0] || "";

// Scrape via ScraperAPI
const fetchPage = async (url: string) => {
  const response = await fetch(
    `https://api.scraperapi.com/?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(
      url
    )}`
  );
  return await response.text();
};

/* ------------------------------------------
   MAIN API
-------------------------------------------*/

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const website = searchParams.get("website");

    if (!website) {
      return NextResponse.json(
        { success: false, error: "Missing website parameter" },
        { status: 400 }
      );
    }

    // SCRAPE 1: Homepage
    const htmlMain = await fetchPage(website);

    // SCRAPE 2: Detect and scrape Contact Page
    const contactPath =
      htmlMain.match(/href="(.*?)contact(.*?)"/i)?.[1] ||
      htmlMain.match(/href='(.*?)contact(.*?)'/i)?.[1] ||
      null;

    let htmlContact = "";
    if (contactPath) {
      const fullContactUrl = contactPath.startsWith("http")
        ? contactPath
        : website + (contactPath.startsWith("/") ? contactPath : "/" + contactPath);

      htmlContact = await fetchPage(fullContactUrl);
    }

    // Combine HTML from homepage + contact page
    const fullHTML = htmlMain + "\n" + htmlContact;

    /* ------------------------------------------
       BASIC EXTRACTION
    -------------------------------------------*/

    const title =
      htmlMain.match(/<title>(.*?)<\/title>/i)?.[1] || "";

    const metaDescription =
      htmlMain.match(
        /<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i
      )?.[1] || "";

    const h1 = decode(htmlMain.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1] || "");

    const schema = extractSchema(fullHTML);

    const emails = cleanEmails(
      Array.from(
        new Set(
          fullHTML.match(
            /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
          ) || []
        )
      )
    );

    const phones = cleanPhones(
      Array.from(
        new Set(
          fullHTML.match(/(\+?\d[\d\s\-\(\)]{7,}\d)/g) || []
        )
      )
    );

    /* ------------------------------------------
       SOCIAL LINKS
    -------------------------------------------*/

    const linkedin = extractUrl(
      fullHTML,
      /https?:\/\/(www\.)?linkedin\.com\/company\/[A-Za-z0-9_.\/-]+/i
    );

    const facebook = (() => {
      const url = extractUrl(
        fullHTML,
        /https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.\/-]+/i
      );
      return url.includes("/tr") ? "" : url;
    })();

    const instagram = extractUrl(
      fullHTML,
      /https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.\/-]+/i
    );

    const yelp = extractUrl(
      fullHTML,
      /https?:\/\/(www\.)?yelp\.com\/biz\/[A-Za-z0-9_-]+/i
    );

    const googleMaps = extractUrl(
      fullHTML,
      /https?:\/\/www\.google\.com\/maps\/[A-Za-z0-9_/.,%-]+/i
    );

    /* ------------------------------------------
       ADDRESS EXTRACTION
    -------------------------------------------*/

    const address =
      schema?.address?.streetAddress ||
      schema?.address?.addressLocality ||
      schema?.address?.addressRegion ||
      schema?.address?.postalCode ||
      fullHTML.match(
        /(Address|Find us at|Location):?\s*(.*?)<br>/i
      )?.[2] ||
      "";

    /* ------------------------------------------
       FINAL RESPONSE
    -------------------------------------------*/

    return NextResponse.json(
      {
        success: true,
        data: {
          website,
          scrapedAt: new Date().toISOString(),

          companyName:
            schema?.name ||
            h1?.split("|")[0]?.trim() ||
            title,

          metaDescription,
          title,
          h1,

          emails,
          phones,

          social: {
            linkedin,
            facebook,
            instagram,
            yelp,
            googleMaps,
          },

          address,
          schema,
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}