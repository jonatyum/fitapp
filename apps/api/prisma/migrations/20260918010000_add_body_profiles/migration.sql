-- CreateTable
CREATE TABLE "body_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sex" TEXT,
    "age" INTEGER,
    "height_cm" DOUBLE PRECISION,
    "weight_kg" DOUBLE PRECISION,
    "neck_cm" DOUBLE PRECISION,
    "waist_cm" DOUBLE PRECISION,
    "hip_cm" DOUBLE PRECISION,
    "resting_hr" INTEGER,
    "body_fat_pct" DOUBLE PRECISION,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "body_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "body_profiles_user_id_key" ON "body_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "body_profiles" ADD CONSTRAINT "body_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
