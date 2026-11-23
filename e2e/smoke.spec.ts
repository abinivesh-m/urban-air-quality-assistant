import { expect, test } from "@playwright/test";

test("renders the dashboard with the default city", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Urban Air Quality Assistant/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Bengaluru" }),
  ).toBeVisible();
  await expect(page.getByRole("meter")).toHaveAttribute("aria-valuenow", "78");
});

test("switching city updates the AQI", async ({ page }) => {
  await page.goto("/");
  await page.selectOption("#city-select", "delhi");
  await expect(
    page.getByRole("heading", { level: 2, name: "New Delhi" }),
  ).toBeVisible();
  await expect(page.getByText("285")).toBeVisible();
});

test("tab navigation exposes the assistant panel", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Assistant" }).click();
  await expect(
    page.getByRole("heading", { level: 2, name: "Air quality assistant" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();
});

test("assistant answers a question", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Assistant" }).click();
  await page
    .getByLabel("Ask the air quality assistant a question")
    .fill("Which mask should I wear?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(/N95/)).toBeVisible();
});

test("indoor hacks accordion expands", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Indoor hacks" }).click();
  await page.getByText("Build a Corsi-Rosenthal box").click();
  await expect(page.getByText(/Clean air delivery is comparable/)).toBeVisible();
});

test("carbon calculator updates live", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Impact" }).click();
  await page.getByLabel("Car travel per day").fill("0");
  await expect(page.getByText("0 km")).toBeVisible();
});

test("skip link is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Skip to main content/i })).toHaveAttribute(
    "href",
    "#main-content",
  );
});
