-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "primary_muscle" TEXT,
ADD COLUMN     "primary_score" INTEGER;

-- CreateIndex
CREATE INDEX "exercises_primary_muscle_primary_score_idx" ON "exercises"("primary_muscle", "primary_score");
