-- AlterTable
ALTER TABLE "Product" ADD COLUMN "featuredOrder" INTEGER;

-- CreateIndex
CREATE INDEX "Product_featured_featuredOrder_idx" ON "Product"("featured", "featuredOrder");
