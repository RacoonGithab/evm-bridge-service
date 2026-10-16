-- CreateEnum
CREATE TYPE "AssetSymbol" AS ENUM ('NIMB', 'GNIMB');

-- CreateEnum
CREATE TYPE "Blockchain" AS ENUM ('BSC', 'BASE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('VERIFIED', 'UNVERIFIED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BridgeRequestStatus" AS ENUM ('PROCESSED', 'APPROVED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "BridgeTransferStatus" AS ENUM ('COMPLETED', 'PROCESSING', 'PENDING', 'FAILED');

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "contract_address" TEXT NOT NULL,
    "symbol" "AssetSymbol" NOT NULL,
    "decimals" INTEGER NOT NULL,
    "price_in_usd" DECIMAL(36,18) NOT NULL,
    "blockchain" "Blockchain" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_states" (
    "id" TEXT NOT NULL,
    "processed_block_number" BIGINT NOT NULL,
    "blockchain" "Blockchain" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blockchain_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bridge_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "amount" DECIMAL(36,18) NOT NULL,
    "to_address" TEXT NOT NULL,
    "from_blockchain" "Blockchain" NOT NULL,
    "to_blockchain" "Blockchain" NOT NULL,
    "exchange_rate" DECIMAL(36,18) NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "status" "BridgeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bridge_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bridge_transfers" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "amount" DECIMAL(36,18) NOT NULL,
    "tx_hash" TEXT,
    "status" "BridgeTransferStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bridge_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_contract_address_key" ON "assets"("contract_address");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_states_blockchain_key" ON "blockchain_states"("blockchain");

-- CreateIndex
CREATE UNIQUE INDEX "bridge_requests_tx_hash_key" ON "bridge_requests"("tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "bridge_transfers_request_id_key" ON "bridge_transfers"("request_id");

-- AddForeignKey
ALTER TABLE "bridge_requests" ADD CONSTRAINT "bridge_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridge_requests" ADD CONSTRAINT "bridge_requests_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridge_transfers" ADD CONSTRAINT "bridge_transfers_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "bridge_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
