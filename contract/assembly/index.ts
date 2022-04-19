import { Context, ContractPromiseBatch, storage, u128 } from "near-sdk-as";
import {
  NFTContractMetadata,
  Token,
  TokenMetadata,
  owner_by_id,
  highest_bid_per_token,
  highest_bid_owner_by_id,
} from "./models";
import NonFungibleToken from "./NonFungibleToken";

var owner_id: string;
const total_supply: u32 = 5;
var token: NonFungibleToken;

export function init(owner_id: string): void {
  storage.set("owner_id", owner_id);
  storage.set<u32>("total_supply", 5);

  token = new NonFungibleToken(
    "AI Generated Collective NFT Collection",
    "AIGCNFTC"
  );
}

export function nft_mint(
  token_id: string,
  receiver_id: string,
  token_metadata: TokenMetadata
): Token {
  return token.nft_mint(token_id, receiver_id, token_metadata);
}

export function nft_tokens(from_index: string, limit: u64): Token[] {
  return token.nft_tokens(from_index, limit);
}

export function nft_token(token_id: string): Token | null {
  return token.nft_token(token_id);
}

export function nft_supply_for_owner(account_id: string): string {
  return token.nft_supply_for_owner(account_id);
}

export function nft_tokens_for_owner(
  account_id: string,
  from_index: string,
  limit: u64
): Token[] {
  return token.nft_tokens_for_owner(account_id, from_index, limit);
}

export function nft_metadata(): NFTContractMetadata {
  return token.nft_metadata();
}

export function nft_total_supply(): string {
  return token.nft_total_supply();
}

export function nft_transfer(
  receiver_id: string,
  token_id: string,
  approval_id: string,
  memo: string
): void {
  token.nft_transfer(receiver_id, token_id, approval_id, memo);
}

export function nft_offer_transfer(token_id: string): bool {
  token.assertCollectionCompleted();
  token.assertOneYoctoDeposit();

  let bid = Context.attachedDeposit;

  let highestBid = highest_bid_per_token.getSome(token_id);
  let highestBidOwner = highest_bid_owner_by_id.get(token_id);
  if (bid < highestBid) return false;

  if (highestBidOwner != null)
    ContractPromiseBatch.create(highestBidOwner!).transfer(
      u128.from(highestBid)
    );

  highest_bid_per_token.set(token_id, bid);
  highest_bid_owner_by_id.set(token_id, Context.sender);

  ContractPromiseBatch.create(Context.contractName).transfer(u128.from(bid));

  return true;
}

export function nft_current_supply(): u32 {
  return owner_by_id.length;
}
