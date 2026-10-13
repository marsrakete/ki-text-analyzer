import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
const reference = JSON.parse(
  await readFile("tests/fixtures/tokenizers.json", "utf8"),
);
const site = JSON.parse(await readFile("config/site.config.json", "utf8"));
test("license appendix is reachable before analysis, serves original texts and fits mobile" /** Exercise the public license link and expandable notices on a narrow viewport.
 * @param {object} context Playwright page fixture.
 * @returns {Promise<void>} Resolves after navigation, resources and geometry pass. */, async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.locator('.site-footer a[href="licenses.html"]'),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "GitHub-Projekt" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "GitHub-Projekt" }),
  ).toHaveAttribute("href", "https://github.com/marsrakete/ki-text-analyzer");
  await page
    .locator(".site-footer")
    .screenshot({ path: "screenshots/footer-mobile.png" });
  await page.locator('.site-footer a[href="licenses.html"]').click();
  await expect(page).toHaveURL(/licenses\.html$/);
  await expect(page.locator("h1")).toHaveText("Lizenzen und Drittanbieter");
  await expect(page.locator(".license-entry")).toHaveCount(12);
  await expect(page.locator("#gemma [data-status]")).toBeVisible();
  await page.locator("#ieee754 summary").click();
  await expect(page.locator("#ieee754 pre")).toContainText("Fair Oaks Labs");
  const width = await page.evaluate(
    /** Read the document width including expanded legal text.
     * @returns {number} Total horizontal document width in CSS pixels. */
    () => document.documentElement.scrollWidth,
  );
  expect(width).toBeLessThanOrEqual(390);
  await page
    .locator("#ieee754")
    .screenshot({ path: "screenshots/licenses-mobile.png" });
  for (const resource of [
    "LICENSE",
    "vendor/licenses/base64-js.txt",
    "vendor/licenses/ieee754.txt",
    "THIRD_PARTY_NOTICES.md",
  ]) {
    const response = await page.request.get("/" + resource);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/plain");
    expect((await response.text()).length).toBeGreaterThan(500);
  }
  await page.getByRole("link", { name: "← Zurück zum Text-Analyzer" }).click();
  await expect(page.locator("#input")).toBeVisible();
});
let errors, failedRequests, externalRequests;
test.beforeEach(
  /** Execute the enclosing operation for the supplied values.
   * @param {*} config1 Input supplied by the enclosing API.
   * @returns {*} Operation result or undefined for a side effect. */
  async ({ page }) => {
    errors = [];
    failedRequests = [];
    externalRequests = [];
    page.on(
      "pageerror",
      /** Collect browser errors or unexpected requests during this test.
       * @param {*} error Input supplied by the enclosing API.
       * @returns {*} Operation result or undefined for a side effect. */
      (error) => errors.push(error.message),
    );
    page.on(
      "requestfailed",
      /** Collect browser errors or unexpected requests during this test.
       * @param {*} request Input supplied by the enclosing API.
       * @returns {*} Operation result or undefined for a side effect. */
      (request) => failedRequests.push(request.url()),
    );
    page.on(
      "request",
      /** Collect browser errors or unexpected requests during this test.
       * @param {*} request Input supplied by the enclosing API.
       * @returns {*} Operation result or undefined for a side effect. */
      (request) => {
        if (
          !request.url().startsWith("http://127.0.0.1:49317/") &&
          !request.url().startsWith("data:")
        )
          externalRequests.push(request.url());
      },
    );
    const response = await page.goto("/");
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle("KI-Text-Analyzer – lokaler Prototyp");
  },
);
test.afterEach(
  /** Execute the enclosing operation for the supplied values.
   * @returns {*} Operation result or undefined for a side effect. */
  async () => {
    expect(errors).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(externalRequests).toEqual([]);
  },
);

test("social metadata, favicon and mobile icons are static, served correctly and browser-decodable" /** Check the real browser's resource resolution, image decoding and metadata.
 * @param {object} context Playwright page fixture.
 * @returns {Promise<void>} Resolves after metadata and assets are verified. */, async ({
  page,
}) => {
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    new URL(site.image, site.url).href,
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
    "content",
    "1200",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    site.url,
  );
  const manifestResponse = await page.request.get("/manifest.webmanifest");
  expect(manifestResponse.status()).toBe(200);
  expect(manifestResponse.headers()["content-type"]).toContain(
    "application/manifest+json",
  );
  const manifest = await manifestResponse.json();
  const jpeg = await page.request.get("/og-image.jpg");
  expect(jpeg.status()).toBe(200);
  expect(jpeg.headers()["content-type"]).toBe("image/jpeg");
  const ico = await page.request.get("/favicon.ico");
  expect(ico.status()).toBe(200);
  expect(ico.headers()["content-type"]).toBe("image/x-icon");
  const images = await page.evaluate(
    /** Decode linked icons and the social image through the browser image loader.
     * @param {object} manifest Mobile manifest with relative icon paths.
     * @returns {Promise<object[]>} Natural dimensions for every loaded image. */
    async (manifest) => {
      const paths = [
        document
          .querySelector('link[data-branding="svg"]')
          .getAttribute("href"),
        document
          .querySelector('link[rel="apple-touch-icon"]')
          .getAttribute("href"),
        "assets/branding/og-image.png",
      ];
      for (const icon of manifest.icons) paths.push(icon.src);
      const images = [];
      for (const path of paths) {
        const image = new Image();
        await new Promise(
          /** Await successful decoding of one local image.
           * @param {Function} resolve Completion callback.
           * @param {Function} reject Image error callback.
           * @returns {void} Registers image events and assigns the source. */
          (resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
            image.src = path;
          },
        );
        images.push({
          path,
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      }
      return images;
    },
    manifest,
  );
  expect(images[0].width).toBe(512);
  expect(images[1].width).toBe(180);
  expect(images[2]).toEqual({
    path: "assets/branding/og-image.png",
    width: 1200,
    height: 630,
  });
  for (let index = 0; index < manifest.icons.length; index++)
    expect(images[index + 3].width + "x" + images[index + 3].height).toBe(
      manifest.icons[index].sizes,
    );
});

/** Display the existing analysis areas using the supplied example.
 * @param {import('@playwright/test').Page} page Browser page.
 * @returns {Promise<void>} Resolves when analysis is visible. */
async function example(page) {
  await page.locator("#sampleBtn").click();
  await page.locator("#analyzeBtn").click();
  await expect(page.locator("#metrics .metric")).toHaveCount(8);
  await expect(page.locator("#analyzeBtn")).toBeEnabled();
}
test("initialization, full example, Unicode, scores and clearing" /** Verify the behavior described by this test case.
 * @param {*} config1 Input supplied by the enclosing API.
 * @returns {*} Operation result or undefined for a side effect. */, async ({
  page,
}) => {
  await expect(page.locator("#results")).toBeHidden();
  await page.locator("#analyzeBtn").click();
  await expect(page.locator("#analysisMessage")).toContainText("Bitte zuerst");
  await example(page);
  await expect(page.locator("#analysisMeaning")).toContainText(
    "keine Wahrscheinlichkeit",
  );
  await expect(page.locator("#analysisMeaning")).toContainText(
    "keine hohe Sicherheit",
  );
  await expect(page.locator("#unicodeVisualized .markerToken")).toHaveCount(4);
  await expect(page.locator("#reasons li")).not.toHaveCount(0);
  await expect(page.locator("#advancedRows tr")).toHaveCount(25);
  await expect(page.locator("#complexityRows tr")).toHaveCount(9);
  await page.locator("#synthPositiveDemoBtn").click();
  await page.locator("#synthAnalyzeBtn").click();
  await expect(page.locator("#synthFinding")).toContainText(
    "starkes Referenzsignal",
  );
  await expect(page.locator("#synthRows tr")).toHaveCount(7);
  await expect(page.locator("#synthMeaning")).toContainText("erhöhte Signal");
  await expect(page.locator("#synthMeaning")).toContainText(
    "nicht kalibrierten Schwellen",
  );
  await page.locator("#synthNgramLen").fill("1");
  await page.locator("#synthAnalyzeBtn").click();
  await expect(page.locator("#tokenizerStatus")).toContainText(
    "zwischen 2 und 20",
  );
  await expect(page.locator("#synthResults")).toBeHidden();
  await page.locator("#clearBtn").click();
  await expect(page.locator("#input")).toHaveValue("");
  await expect(page.locator("#results")).toBeHidden();
});
test("both local tokenizers match independent fixtures with empty cache and external network blocked" /** Verify the behavior described by this test case.
 * @param {*} config1 Input supplied by the enclosing API.
 * @returns {*} Operation result or undefined for a side effect. */, async ({
  page,
}) => {
  await page.route(
    "**/*",
    /** Respond to the controlled browser request for this test.
     * @param {*} route Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    async (route) => {
      if (route.request().url().startsWith("http://127.0.0.1:49317/"))
        await route.continue();
      else await route.abort();
    },
  );
  await example(page);
  for (const name of ["gpt2", "gemma"]) {
    await page.locator("#synthTokenizerChoice").selectOption(name);
    await page.locator("#prepareTokenizerBtn").click();
    await expect(page.locator("#synthPrereq")).toHaveClass("calloutGood", {
      timeout: 40000,
    });
    const vectors = await page.evaluate(
      /** Inspect or exercise page state inside the browser.
       * @param {*} config1 Input supplied by the enclosing API.
       * @returns {*} Operation result or undefined for a side effect. */
      async ({ name, reference }) => {
        const { createGPT2Tokenizer } =
          await import("/src/services/gpt2-tokenizer.js");
        const { createGemmaTokenizer } =
          await import("/src/services/gemma-tokenizer.js");
        let tokenizer;
        if (name === "gpt2")
          tokenizer = createGPT2Tokenizer(await import("/vendor/gpt2.js"));
        else
          tokenizer = await createGemmaTokenizer(
            await import("/vendor/sentencepiece.js"),
            new Uint8Array(
              await (
                await fetch("/assets/tokenizers/gemma.model")
              ).arrayBuffer(),
            ),
          );
        return reference.vectors.map(
          /** Extract the calculated value used by the enclosing collection.
           * @param {*} vector Input supplied by the enclosing API.
           * @returns {*} Operation result or undefined for a side effect. */
          (vector) => ({
            ids: tokenizer.encode(vector.text, {
              addBos: false,
            }),
            withBos: tokenizer.encode(vector.text, {
              addBos: true,
            }),
          }),
        );
      },
      {
        name,
        reference,
      },
    );
    for (let index = 0; index < reference.vectors.length; index++) {
      expect(vectors[index].ids).toEqual(reference.vectors[index][name]);
      if (name === "gemma")
        expect(vectors[index].withBos).toEqual([
          reference.source.gemmaBosId,
          ...reference.vectors[index].gemma,
        ]);
    }
    await page.locator("#synthAnalyzeBtn").click();
    await expect(page.locator("#synthResults")).toBeVisible();
    await expect(page.locator("#synthFinding")).toContainText(
      "Weighted-Mean-Score",
    );
    await page.locator("#clearTokenizerCacheBtn").click();
    await expect(page.locator("#tokenizerStatus")).toHaveText(
      "Tokenizer-Cache gelöscht.",
    );
    const count = await page.evaluate(
      /** Inspect or exercise page state inside the browser.
       * @returns {*} Operation result or undefined for a side effect. */
      async () => {
        const database = await new Promise(
          /** Inspect or exercise page state inside the browser.
           * @param {*} resolve Input supplied by the enclosing API.
           * @param {*} reject Input supplied by the enclosing API.
           * @returns {*} Operation result or undefined for a side effect. */
          (resolve, reject) => {
            const request = indexedDB.open("ki-text-analyzer-assets", 1);
            request.onsuccess =
              /** Inspect or exercise page state inside the browser.
               * @returns {*} Operation result or undefined for a side effect. */
              () => resolve(request.result);
            request.onerror =
              /** Inspect or exercise page state inside the browser.
               * @returns {*} Operation result or undefined for a side effect. */
              () => reject(request.error);
          },
        );
        try {
          return await new Promise(
            /** Inspect or exercise page state inside the browser.
             * @param {*} resolve Input supplied by the enclosing API.
             * @param {*} reject Input supplied by the enclosing API.
             * @returns {*} Operation result or undefined for a side effect. */
            (resolve, reject) => {
              const request = database
                .transaction("assets", "readonly")
                .objectStore("assets")
                .count();
              request.onsuccess =
                /** Inspect or exercise page state inside the browser.
                 * @returns {*} Operation result or undefined for a side effect. */
                () => resolve(request.result);
              request.onerror =
                /** Inspect or exercise page state inside the browser.
                 * @returns {*} Operation result or undefined for a side effect. */
                () => reject(request.error);
            },
          );
        } finally {
          database.close();
        }
      },
    );
    expect(count).toBe(0);
  }
});
test("Gemma survives reload with its model cached and recovers from local asset failure" /** Verify the behavior described by this test case.
 * @param {*} config1 Input supplied by the enclosing API.
 * @returns {*} Operation result or undefined for a side effect. */, async ({
  page,
}) => {
  await example(page);
  await page.route(
    "**/assets/tokenizers/gemma.model",
    /** Respond to the controlled browser request for this test.
     * @param {*} route Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    (route) =>
      route.fulfill({
        status: 404,
        body: "Missing model",
      }),
  );
  await page.locator("#prepareTokenizerBtn").click();
  await expect(page.locator("#synthPrereq")).toHaveClass("calloutWarn");
  await expect(page.locator("#tokenizerStatus")).toContainText("404");
  await expect(page.locator("#prepareTokenizerBtn")).toBeEnabled();
  await page.unroute("**/assets/tokenizers/gemma.model");
  await page.locator("#prepareTokenizerBtn").click();
  await expect(page.locator("#synthPrereq")).toHaveClass("calloutGood", {
    timeout: 40000,
  });
  await page.reload();
  await example(page);
  await page.route(
    "**/assets/tokenizers/gemma.model",
    /** Respond to the controlled browser request for this test.
     * @param {*} route Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    (route) =>
      route.fulfill({
        status: 404,
        body: "Model must come from cache",
      }),
  );
  await page.locator("#prepareTokenizerBtn").click();
  await expect(page.locator("#synthPrereq")).toHaveClass("calloutGood", {
    timeout: 40000,
  });
  await expect(page.locator("#tokenizerStatus")).toContainText(
    "aus Browser-Cache",
  );
});
for (const width of [390, 768, 1280]) {
  test(
    "layout stays contained at width " + width,
    /** Verify the behavior described by this test case.
     * @param {*} config1 Input supplied by the enclosing API.
     * @returns {*} Operation result or undefined for a side effect. */
    async ({ page }) => {
      await page.setViewportSize({
        width,
        height: 900,
      });
      await example(page);
      await expect(page.locator("#analysisMeaning")).toBeVisible();
      await page.locator("#synthPositiveDemoBtn").click();
      await page.locator("#synthAnalyzeBtn").click();
      await expect(page.locator("#synthMeaning")).toBeVisible();
      await page
        .locator("#analysisMeaning")
        .screenshot({ path: "screenshots/analysis-meaning-" + width + ".png" });
      await page
        .locator("#synthMeaning")
        .screenshot({ path: "screenshots/synth-meaning-" + width + ".png" });
      const geometry = await page.evaluate(
        /** Inspect or exercise page state inside the browser.
         * @returns {*} Operation result or undefined for a side effect. */
        () => {
          const input = document
            .getElementById("input")
            .getBoundingClientRect();
          const metrics = [
            ...document.querySelectorAll("#metrics .metric"),
          ].map(
            /** Extract the calculated value used by the enclosing collection.
             * @param {*} element Input supplied by the enclosing API.
             * @returns {*} Operation result or undefined for a side effect. */
            (element) => {
              const box = element.getBoundingClientRect();
              return {
                left: box.left,
                right: box.right,
                top: box.top,
                bottom: box.bottom,
              };
            },
          );
          const cards = [
            ...document.querySelectorAll("main>.card,#results>.card"),
          ]
            .filter(
              /** Keep JavaScript files for the syntax and contract checks.
               * @param {*} element Input supplied by the enclosing API.
               * @returns {*} Operation result or undefined for a side effect. */
              (element) => element.getBoundingClientRect().height > 0,
            )
            .map(
              /** Extract the calculated value used by the enclosing collection.
               * @param {*} element Input supplied by the enclosing API.
               * @returns {*} Operation result or undefined for a side effect. */
              (element) => ({
                right: element.getBoundingClientRect().right,
                left: element.getBoundingClientRect().left,
              }),
            );
          const overflow = [...document.querySelectorAll("main *")]
            .filter(
              /** Keep JavaScript files for the syntax and contract checks.
               * @param {*} element Input supplied by the enclosing API.
               * @returns {*} Operation result or undefined for a side effect. */
              (element) => element.getBoundingClientRect().right > innerWidth,
            )
            .map(
              /** Extract the calculated value used by the enclosing collection.
               * @param {*} element Input supplied by the enclosing API.
               * @returns {*} Operation result or undefined for a side effect. */
              (element) => ({
                tag: element.tagName,
                id: element.id,
                className: element.className,
                right: element.getBoundingClientRect().right,
                text: element.textContent.slice(0, 100),
              }),
            );
          return {
            scroll: document.documentElement.scrollWidth,
            viewport: innerWidth,
            input: {
              left: input.left,
              right: input.right,
              width: input.width,
            },
            metrics,
            cards,
            overflow,
          };
        },
      );
      expect(
        geometry.scroll,
        JSON.stringify(geometry.overflow),
      ).toBeLessThanOrEqual(width);
      expect(geometry.input.left).toBeGreaterThanOrEqual(0);
      expect(geometry.input.right).toBeLessThanOrEqual(width);
      expect(geometry.input.width).toBeGreaterThan(200);
      for (const card of geometry.cards) {
        expect(card.left).toBeGreaterThanOrEqual(0);
        expect(card.right).toBeLessThanOrEqual(width);
      }
      for (let index = 1; index < geometry.metrics.length; index++) {
        const before = geometry.metrics[index - 1],
          after = geometry.metrics[index];
        expect(after.top >= before.bottom || after.left >= before.right).toBe(
          true,
        );
      }
      await page.screenshot({
        path: "screenshots/analysis-" + width + ".png",
        fullPage: true,
      });
    },
  );
}
