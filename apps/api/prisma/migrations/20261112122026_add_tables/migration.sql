-- CreateTable
CREATE TABLE "tables" (
    "number" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("number")
);
