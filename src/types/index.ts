export interface EscrowDeal {
  seller: string;
  buyer: string;
  amount: number;
  status: 'pending' | 'funded' | 'released' | 'refunded' | 'disputed';
  createdAt: number;
  description: string;
}

export interface Dispute {
  dealId: number;
  initiator: string;
  reason: string;
  resolution?: 'seller' | 'buyer';
}

export interface EscrowStats {
  totalDeals: number;
  activeDeals: number;
  completedDeals: number;
  totalVolume: number;
}

export interface WalletState {
  address: string | null;
  connected: boolean;
  balance: number;
}

export interface TransactionResult {
  txId: string;
  success: boolean;
  error?: string;
}
