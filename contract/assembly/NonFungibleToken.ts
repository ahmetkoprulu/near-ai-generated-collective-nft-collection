import {
  PersistentSet,
  logging,
  Context,
  ContractPromiseBatch,
  u128,
} from "near-sdk-as";
import { JSONEncoder } from "assemblyscript-json";
import {
  highest_bid_owner_by_id,
  highest_bid_per_token,
  NFTContractMetadata,
  Token,
  TokenMetadata,
  owner_by_id,
  tokens_per_owner,
  token_metadata_by_id,
  total_supply,
} from "./models";

// Reference https://nomicon.io/Standards/Tokens/NonFungibleToken/
interface NEP171 {
  // total_supply: u64;
  // owner_by_id: PersistentUnorderedMap<string, string>;
  nft_total_supply(): string;
  nft_mint(
    token_id: string,
    receiver_id: string,
    token_metadata: TokenMetadata
  ): Token;
  nft_token(token_id: string): Token | null;
  nft_transfer(
    receiver_id: string,
    token_id: string,
    approval_id: string,
    memo: string
  ): void;
}

// NEP177 NFT Metadata Extension Interface
export interface NEP177 {
  // metadata: NFTContractMetadata;
  // token_metadata_by_id: PersistentUnorderedMap<string, TokenMetadata>; // <token, metadata>

  nft_metadata(): NFTContractMetadata;
}

// NEP181 NFT Enumeration Extension Interface
export interface NEP181 {
  // tokens_per_owner: PersistentUnorderedMap<string, PersistentSet<string>>; // <account, token[]>

  nft_tokens(from_index: string, limit: u64): Token[];
  nft_supply_for_owner(account_id: string): string;
  nft_tokens_for_owner(
    account_id: string,
    from_index: string,
    limit: u64
  ): Token[];
}

// NEP171 NFT Core implementation
export default class NonFungibleToken implements NEP171, NEP177, NEP181 {
  total_supply: u32 = 10;
  extra_storage_in_bytes_per_token: u64;
  metadata: NFTContractMetadata;

  constructor(name: string, symbol: string) {
    this.metadata = {
      spec: "nft-1.0.0",
      name: name,
      symbol: symbol,
      icon: "",
      base_uri: "",
      reference: "",
      reference_hash: "",
    };
    this.extra_storage_in_bytes_per_token = 0;
  }

  nft_mint(
    token_id: string,
    receiver_id: string,
    token_metadata: TokenMetadata
  ): Token {
    logging.log(
      `${receiver_id} intented to mint ${token_id}: ${token_metadata.media}`
    );
    this.assertOneYoctoDeposit();
    this.assertMaximumSupplyExceed();

    let token: Token = {
      token_id: token_id,
      owner_id: receiver_id,
      metadata: token_metadata,
      highest_bid: u128.Zero,
    };

    let tokens = tokens_per_owner.get(receiver_id);
    if (!tokens) tokens = new PersistentSet(`${receiver_id}_t`);

    tokens.add(token_id);
    tokens_per_owner.set(receiver_id, tokens);
    owner_by_id.set(token_id, receiver_id);
    token_metadata_by_id.set(token_id, token_metadata);
    highest_bid_per_token.set(token_id, u128.Zero);

    ContractPromiseBatch.create(Context.contractName).transfer(
      u128.from(Context.attachedDeposit)
    );

    logging.log!(this.getNFTMintEventLog(receiver_id, token_id));

    return token;
  }

  nft_token(token_id: string): Token | null {
    let ownerId = owner_by_id.getSome(token_id);
    let metadata = token_metadata_by_id.getSome(token_id);
    let highestBid = highest_bid_per_token.getSome(token_id);

    return {
      token_id: token_id,
      owner_id: ownerId,
      metadata: metadata,
      highest_bid: highestBid,
    };
  }

  nft_tokens(from_index: string, limit: u64): Token[] {
    let tokens = new Array<Token>();
    let token_ids = token_metadata_by_id.keys();

    for (let i: i32 = 0; i < token_ids.length; i++) {
      let tokenId = token_ids[i];
      let metadata = token_metadata_by_id.getSome(tokenId);
      let ownerId = owner_by_id.getSome(tokenId);
      let highestBid = highest_bid_per_token.getSome(tokenId);

      tokens.push({
        token_id: tokenId,
        owner_id: ownerId,
        metadata: metadata,
        highest_bid: highestBid,
      });
    }

    return tokens;
  }

  nft_supply_for_owner(account_id: string): string {
    let accountTokens = tokens_per_owner.get(account_id);
    if (accountTokens == null) return "0";

    return accountTokens.size.toString();
  }

  nft_tokens_for_owner(
    account_id: string,
    from_index: string,
    limit: u64
  ): Token[] {
    let tokens = new Array<Token>();
    let accountTokensSet = tokens_per_owner.get(account_id);

    if (accountTokensSet == null) return new Array<Token>(0);
    let accountTokens = accountTokensSet.values();
    for (let i: i32 = 0; i < accountTokensSet.size; i++) {
      let tokenId = accountTokens[i];
      let metadata = token_metadata_by_id.getSome(tokenId);
      let highestBid = highest_bid_per_token.getSome(tokenId);

      tokens.push({
        token_id: tokenId,
        owner_id: account_id,
        metadata: metadata,
        highest_bid: highestBid,
      });
    }

    return tokens;
  }

  nft_metadata(): NFTContractMetadata {
    return this.metadata;
  }

  nft_total_supply(): string {
    return total_supply.toString();
  }

  nft_transfer(
    receiver_id: string,
    token_id: string,
    approval_id: string,
    memo: string
  ): void {
    this.assertCollectionCompleted();

    let ownerId = owner_by_id.getSome(token_id);
    this.assertSenderIsOwner(ownerId);

    let bid = highest_bid_per_token.getSome(token_id);
    this.assertBidIsNotZero(bid);

    receiver_id = highest_bid_owner_by_id.getSome(token_id);

    let ownerTokens = this.getOwnerTokenSet(ownerId);
    ownerTokens.delete(token_id);
    tokens_per_owner.set(ownerId, ownerTokens);

    let receiverTokens = this.getOwnerTokenSet(receiver_id);
    receiverTokens.add(token_id);
    tokens_per_owner.set(receiver_id, receiverTokens);

    owner_by_id.set(token_id, receiver_id);
    highest_bid_owner_by_id.delete(token_id);
    highest_bid_per_token.set(token_id, u128.Zero);

    ContractPromiseBatch.create(ownerId).transfer(u128.from(bid));
  }

  private getOwnerTokenSet(owner_id: string): PersistentSet<string> {
    let tokens = tokens_per_owner.get(owner_id);
    if (tokens == null) tokens = new PersistentSet(`${owner_id}_t`);

    return tokens;
  }

  private getNFTMintEventLog(owner_id: string, token_id: string): string {
    let encoder = new JSONEncoder();
    encoder.pushObject("EVENT_JSON");
    encoder.setString("standard", "nep171");
    encoder.setString("version", "1.0.0");
    encoder.setString("event", "nft_mint");
    encoder.pushObject("data");
    encoder.setString("owner_id", owner_id);
    encoder.pushArray("token_ids");
    encoder.setString(null, token_id);
    encoder.popArray();
    encoder.popObject();
    encoder.popObject();

    return encoder.toString();
  }

  private assertBidIsNotZero(bid: u128): bool {
    return assert(bid > u128.Zero, "Cannot sell token for free.");
  }

  private assertSenderIsOwner(owner_id: string): bool {
    return assert(
      owner_id == Context.sender,
      "Only owners can transfer their assets."
    );
  }

  public assertCollectionCompleted(): bool {
    return assert(
      owner_by_id.length >= total_supply,
      "Collection should end before trade"
    );
  }

  public assertOneYoctoDeposit(): bool {
    return assert(
      Context.attachedDeposit.toU32() > 1,
      "Requires attached deposit of exactly 1 yoctoNEAR"
    );
  }

  private assertMaximumSupplyExceed(): bool {
    return assert(owner_by_id.length < 10, "Maximum supply limit exceed");
  }
}
