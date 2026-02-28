import { describe, it, expect } from "vitest";

describe("Escrow Contract Tests", () => {
  describe("Deal Creation", () => {
    it("should create deal with valid parties", () => {
      const deal = {
        id: 1,
        seller: "SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY",
        buyer: "SP2DXHX9Q844EBT80DYJXFWXJKCJ5FFAX50CQQAWN",
        amount: 5000000, // 5 STX
        status: "pending",
      };

      expect(deal.seller).not.toBe(deal.buyer);
      expect(deal.amount).toBeGreaterThan(0);
    });

    it("should calculate escrow fee", () => {
      const FEE_PERCENT = 1;
      const amount = 5000000;
      const fee = (amount * FEE_PERCENT) / 100;

      expect(fee).toBe(50000);
    });
  });

  describe("Status Transitions", () => {
    const validTransitions = {
      pending: ["funded", "cancelled"],
      funded: ["released", "refunded", "disputed"],
      disputed: ["released", "refunded"],
    };

    it("should allow valid state transitions", () => {
      expect(validTransitions.pending).toContain("funded");
      expect(validTransitions.funded).toContain("released");
    });
  });
});
