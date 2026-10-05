-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Url" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "shortCode" VARCHAR(10) NOT NULL,
    "customAlias" VARCHAR(50),
    "originalUrl" TEXT NOT NULL,
    "title" VARCHAR(200),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Click" (
    "id" BIGSERIAL NOT NULL,
    "urlId" UUID NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "referrer" TEXT,
    "country" VARCHAR(2),
    "deviceType" VARCHAR(20),
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Url_shortCode_key" ON "Url"("shortCode");
CREATE UNIQUE INDEX "Url_customAlias_key" ON "Url"("customAlias");
CREATE INDEX "Url_userId_idx" ON "Url"("userId");
CREATE INDEX "Url_expiresAt_idx" ON "Url"("expiresAt");
CREATE INDEX "Click_urlId_clickedAt_idx" ON "Click"("urlId", "clickedAt");
CREATE INDEX "Click_country_idx" ON "Click"("country");
CREATE INDEX "Click_referrer_idx" ON "Click"("referrer");

ALTER TABLE "Click" ADD CONSTRAINT "Click_urlId_fkey"
  FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE CASCADE ON UPDATE CASCADE;
