-- DropForeignKey
ALTER TABLE "public"."bills" DROP CONSTRAINT "bills_tableId_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_tableId_fkey";

-- AlterTable
ALTER TABLE "public"."bills" ALTER COLUMN "tableId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."menu_items" ADD COLUMN     "imageKey" TEXT;

-- AlterTable
ALTER TABLE "public"."order_items" ADD COLUMN     "menuItemName" TEXT,
ALTER COLUMN "menuItemId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "tableNumber" TEXT,
ALTER COLUMN "tableId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."tables" ADD COLUMN     "lastClearedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "number" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "public"."uploaded_files" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DraftCart" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DraftCartItem" (
    "id" TEXT NOT NULL,
    "draftCartId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "quantity" INTEGER NOT NULL,
    "menuItemName" TEXT,
    "menuItemPrice" DOUBLE PRECISION,

    CONSTRAINT "DraftCartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uploaded_files_key_key" ON "public"."uploaded_files"("key");

-- CreateIndex
CREATE UNIQUE INDEX "DraftCart_tableId_key" ON "public"."DraftCart"("tableId");

-- CreateIndex
CREATE INDEX "DraftCartItem_draftCartId_idx" ON "public"."DraftCartItem"("draftCartId");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bills" ADD CONSTRAINT "bills_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "public"."tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "public"."menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DraftCartItem" ADD CONSTRAINT "DraftCartItem_draftCartId_fkey" FOREIGN KEY ("draftCartId") REFERENCES "public"."DraftCart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DraftCartItem" ADD CONSTRAINT "DraftCartItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "public"."menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
