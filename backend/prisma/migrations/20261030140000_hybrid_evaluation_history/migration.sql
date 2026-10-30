ALTER TABLE "candidates" ADD COLUMN "latestEvaluationId" TEXT;

CREATE TABLE "job_rubric_versions" (
  "id" TEXT NOT NULL, "jobId" TEXT NOT NULL, "sourceHash" TEXT NOT NULL,
  "snapshot" JSONB NOT NULL, "requiredSkills" JSONB NOT NULL, "weights" JSONB NOT NULL,
  "approvedBy" TEXT, "approvedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "job_rubric_versions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_rubric_versions_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "job_rubric_versions_jobId_sourceHash_idx" ON "job_rubric_versions"("jobId", "sourceHash");

CREATE TABLE "evaluation_runs" (
  "id" TEXT NOT NULL, "candidateId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING',
  "rubricId" TEXT, "snapshot" JSONB NOT NULL, "report" JSONB, "cvHash" TEXT, "modelId" TEXT,
  "promptVersion" TEXT NOT NULL DEFAULT 'hybrid-v1', "errorCode" TEXT, "claimToken" TEXT,
  "claimedAt" TIMESTAMP(3), "finishedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "evaluation_runs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "evaluation_runs_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "evaluation_runs_candidateId_createdAt_idx" ON "evaluation_runs"("candidateId", "createdAt");
CREATE INDEX "evaluation_runs_status_createdAt_idx" ON "evaluation_runs"("status", "createdAt");

CREATE TABLE "evaluation_events" (
  "id" TEXT NOT NULL, "evaluationId" TEXT NOT NULL, "type" TEXT NOT NULL, "deduplicationKey" TEXT,
  "data" JSONB NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "evaluation_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "evaluation_events_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluation_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "evaluation_events_deduplicationKey_key" ON "evaluation_events"("deduplicationKey");
CREATE INDEX "evaluation_events_evaluationId_createdAt_idx" ON "evaluation_events"("evaluationId", "createdAt");
