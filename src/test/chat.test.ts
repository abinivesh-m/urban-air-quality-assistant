import { describe, it, expect } from "vitest";
import { generateResponse } from "@/app/api/chat/route";

// We need to extract generateResponse for testing
// Since it's not exported, we'll test via the POST handler

describe("Chat API", () => {
  it("should return a response for PM2.5 question", async () => {
    const { POST } = await import("@/app/api/chat/route");
    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "What is PM2.5?" }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.reply).toContain("PM2.5");
    expect(data.reply).toContain("particulate");
  });

  it("should return a response for mask question", async () => {
    const { POST } = await import("@/app/api/chat/route");
    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Which mask should I use?" }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.reply).toContain("N95");
  });

  it("should return a response for indoor air question", async () => {
    const { POST } = await import("@/app/api/chat/route");
    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "How to improve indoor air?" }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.reply).toContain("indoor");
  });

  it("should return 400 for empty message", async () => {
    const { POST } = await import("@/app/api/chat/route");
    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("should return default response for unknown topic", async () => {
    const { POST } = await import("@/app/api/chat/route");
    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello there" }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.reply).toContain("Great question");
  });

  it("should handle invalid JSON gracefully", async () => {
    const { POST } = await import("@/app/api/chat/route");
    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});