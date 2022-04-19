import {
  PersistentMap,
  PersistentSet,
  PersistentUnorderedMap,
  u128,
} from "near-sdk-as";

export const owner_by_id = new PersistentUnorderedMap<string, string>(
  "owner_by_id"
); // <token, account>

export const token_metadata_by_id = new PersistentUnorderedMap<
  string,
  TokenMetadata
>("token_metadata_by_id"); // <token, metadata>

export const tokens_per_owner = new PersistentUnorderedMap<
  string,
  PersistentSet<string>
>("tokens_per_owner"); // <account, token[]>

export const highest_bid_per_token = new PersistentMap<string, u128>(
  "highest_bid_per_offer"
); // <token, price>

export const highest_bid_owner_by_id = new PersistentMap<string, string>(
  "highest_bid_owner_by_id"
); // <token, account>

export const total_supply = 5;

@nearBindgen
export class Token {
  public token_id: string;
  public owner_id: string;
  public metadata: TokenMetadata; // Required for NEP-177s
  public highest_bid: u128 = u128.Zero;
}

@nearBindgen
export class TokenMetadata {
  public title: string;
  public description: string;
  public media: string;
  public media_hash: string;
  public copies: u32;
  public issued_at: u32;
  public expires_at: u32;
  public starts_at: u32;
  public updated_at: u32;
  public extra: string; // anything extra the NFT wants to store on-chain. Can be stringified JSON.
  public reference: string; // URL to an off-chain JSON file with more info.
  public reference_hash: string;
}

@nearBindgen
export class NFTContractMetadata {
  public spec: string; // required, essentially a version like "nft-2.0.0", replacing "2.0.0" with the implemented version of NEP-177
  public name: string; // required, ex. "Mochi Rising — Digital Edition" or "Metaverse 3"
  public symbol: string; // required, ex. "MOCHI"
  public icon: string; // Data URL
  public base_uri: string; // Centralized gateway known to have reliable access to decentralized storage assets referenced by `reference` or `media` URLs
  public reference: string; // URL to a JSON file with more info
  public reference_hash: string;
}

// NEP-297 Actions Interface
export interface NftEventLogData {
  standard: "nep171";
  version: "1.0.0";
  event: string;
  data: NftMintLog[];
}

export interface NftMintLog {
  owner_id: string;
  token_ids: string[];
  memo: string;
}

export interface NftBurnLog {
  owner_id: string;
  authorized_id: string;
  token_ids: string[];
  memo: string;
}

interface NftTransferLog {
  authorized_id: string;
  old_owner_id: string;
  new_owner_id: string;
  token_ids: string[];
  memo: string;
}
