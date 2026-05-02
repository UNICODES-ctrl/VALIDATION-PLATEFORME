/*
  Warnings:

  - You are about to drop the column `operateur` on the `Paiement` table. All the data in the column will be lost.
  - You are about to drop the column `recu` on the `Paiement` table. All the data in the column will be lost.
  - You are about to drop the column `referencePay` on the `Paiement` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('VIREMENT', 'TMONEY', 'FLOOZ');

-- AlterTable
ALTER TABLE "Paiement" DROP COLUMN "operateur",
DROP COLUMN "recu",
DROP COLUMN "referencePay",
ADD COLUMN     "bordereauUrl" TEXT,
ADD COLUMN     "commentaire" TEXT,
ADD COLUMN     "modePaiement" "ModePaiement" NOT NULL DEFAULT 'VIREMENT',
ALTER COLUMN "telephone" DROP NOT NULL;

-- DropEnum
DROP TYPE "Operateur";
