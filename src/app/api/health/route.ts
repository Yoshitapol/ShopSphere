// ============================================================================
// ShopSphere System Health & Sanitized Environment Audit Endpoint (/api/health)
// Experiment 9: Docker Container Health Check Endpoint
// Experiment 10: Sanitized Environment Variable Audit (Zero Secrets Exposed)
// ============================================================================
import { NextResponse } from "next/server";
import { getDatabaseHealthStatus } from "@/lib/mongodb/product-service";
import { getSanitizedEnvAudit } from "@/lib/env";

export async function GET() {
  const health = await getDatabaseHealthStatus();
  const envAudit = getSanitizedEnvAudit();

  return NextResponse.json(
    {
      status: "ok",
      service: "ShopSphere E-Commerce Platform",
      timestamp: new Date().toISOString(),
      databases: health,
      environmentAudit: envAudit,
    },
    { status: 200 }
  );
}
