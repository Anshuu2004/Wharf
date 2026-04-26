-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "options" JSONB,
    "repoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserApiKey" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_owner_name_userId_key" ON "Repository"("owner", "name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserApiKey_userId_key" ON "UserApiKey"("userId");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserApiKey" ADD CONSTRAINT "UserApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
