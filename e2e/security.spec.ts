import { expect, test } from "@playwright/test";

test("rejects anonymous access to admin and upload endpoints", async ({ request }) => {
  const postCases = [
    {
      body: { data: [{ country: "BR", name: "Projeto", project_id: "demo-project" }] },
      url: "/api/carbon-plan/upload/projects",
    },
    {
      body: { data: [{ project_id: "demo-project", quantity: 1 }] },
      url: "/api/carbon-plan/upload/credits",
    },
    {
      body: { args: [], script: "check-domains.ts" },
      url: "/api/admin/scripts/run",
    },
  ];

  for (const testCase of postCases) {
    const response = await request.post(testCase.url, {
      data: testCase.body,
    });

    expect(response.status(), testCase.url).toBe(401);
  }
});

test("keeps debug and removed test-email endpoints unavailable to anonymous users", async ({ request }) => {
  const debugResponse = await request.get("/api/debug");
  expect([401, 404]).toContain(debugResponse.status());

  const testEmailResponse = await request.get("/api/test-email");
  expect(testEmailResponse.status()).toBe(404);
});
