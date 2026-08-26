-- AlterTable
ALTER TABLE "User" ADD COLUMN "lineId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_lineId_key" ON "User"("lineId");
