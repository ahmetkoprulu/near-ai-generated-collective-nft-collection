<div align="center">
    <h3 align="center">AI Generated Collective NFT Collection</h3>
</div>
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#objective">Objective</a>
    </li>
        <li>
      <a href="#infrastructure">Infrastructure</a>
    </li>
        <li>
      <a href="#development">Development</a>
    </li>
    <li>
      <a href="#deployment">Deployment</a>
    </li>
    <li><a href="#troubleshooting">Troubleshooting</a></li>
    <li><a href="#code-review">Code Review</a></li>
  </ol>
</details>

### Objective

This project aims to making people able to create nft collections by directly contributing itself. Rather than minting predefined assets, mintable assets will be generated before minting process via image generating artifical intelligence algorithm. Therefore, each collection will be unique and contributors will be able to write their own story. Also, the contract lives as a marketplace for the collection to let the assets find their price in the first place.

You can check [loom video]

### Infrastructure

The project is built on near protocol and implements token standard NEP171 (Standard NFT Interface) and its extensions NEP 181 (Enumeration) and NEP177 (Metadata). While generated assets are stored on remote server, related informations including media url are stored on the near chain. Images will be generated via <b>Deep AI</b>'s text to image api.

### Development

This project was initialized with [create-near-app]

Project structure:

1. The "backend" code lives in the `/contract` folder.
2. The "frontend" code lives in the `/src` folder.
3. The main smart contract code lives in `assembly/index.ts`. You can compile
   it with the `./compile` script.
4. The entry point for vue app is `/src/main.js`

To run this project quickly in local environment:

1. Prerequisites: Make sure you've installed [Node.js] ≥ 12
2. Clone the repository: `git clone https://github.com/ahmetkoprulu/near-ai-generated-collective-nft-collection`
3. Install dependencies: `yarn install`
4. Run the local development server: `yarn dev`

Scripts:

1. `yarn dev` hot reloads, builds and deploys the main contract and serves vue app
2. `yarn prestart` builds and deploys the main app <b>but</b> does not serves vue app.
3. `yarn serve` serves the vue app <b>but</b> does not deploys the contract.
4. `yarn test` runs tests for backend and frontend.
5. `yarn test:web` runs tests for frontend.

### Deployment

When you run `yarn dev`, your smart contract gets deployed to the live NEAR TestNet with a throwaway account. To make it permanent you need an account.

Assuming you have an account, you need to modify the line in `src/config.js` that sets the account name of the contract. Set it to the account name you created.

    const CONTRACT_NAME = process.env.CONTRACT_NAME || {{ Your Contract Name Here }}

Running `yarn deploy` will do the trick. However, what actually it does is:

1. builds & deploys smart contract to NEAR TestNet
2. builds & deploys frontend code to GitHub using [gh-pages]. This will only work if the project already has a repository set up on GitHub. You can modify the `deploy` script in `package.json` to deploy elsewhere.

### Troubleshooting

On Windows, if you're seeing an error containing `EPERM` it may be related to spaces in your path. Please see [this issue](https://github.com/zkat/npx/issues/209) for more details.

### Code Review

NonFungibleToken.ts

```ts
interface NEP171 {
  total_supply: u64; // Maximum number of tokens can be generated.
  owner_by_id: PersistentUnorderedMap<string, string>; // <token, account>{}

  // Return total supply.
  // near view $CONTRACT nft_total_supply --accountId $ACCOUNT
  nft_total_supply(): string;

  /*
    Generates token and their ownership then transfers minting fee to contract account and emits nft_minted event.

    TOKEN_METADATA = {
            title: "264ef705-df55-4c94-89d2-74aa9fa4705a",
            description: "AI generated image.",
            media: "https://some-url.com,
            media_hash: "",
            copies: 1,
            issued_at: 0,
            expires_at: 0,
            starts_at: 0,
            updated_at: 0,
            extra: "",
            reference: "",
            reference_hash: ""
          }

    near call $CONTRACT nft_mint '{"token_id": "","receiver_id": "","token_metadata": {}}' --accountId $ACCOUNT --deposit 1 --gas 300000000000000
  */
  nft_mint(
    token_id: string,
    receiver_id: string,
    token_metadata: TokenMetadata
  ): Token;

  // Returns specified token if exists otherwise returns null.
  // near view $CONTRACT nft_token --accountId $ACCOUNT '{"token_id": ""}'
  nft_token(token_id: string): Token | null;

  // Replaces tokens ownership to the user who placed highest bid and transfer bid to previous owner of token.
  // near call $CONTRACT nft_transfer '{"receiver_id": "", "token_id": "", "approval_id": "", "memo": ""}' --accountId $ACCOUNT --gas 300000000000000
  nft_transfer(
    receiver_id: string,
    token_id: string,
    approval_id: string,
    memo: string
  ): void;
}

export interface NEP177 {
  metadata: NFTContractMetadata; // Metadata of the contract which keeps nft standard version, name, etc...
  token_metadata_by_id: PersistentUnorderedMap<string, TokenMetadata>; // <token, metadata>{}

  // Returns contract metadata.
  // near view $CONTRACT nft_metadata --accountId $ACCOUNT
  nft_metadata(): NFTContractMetadata;
}

export interface NEP181 {
  tokens_per_owner: PersistentUnorderedMap<string, PersistentSet<string>>; // <account, token[]>{}

  // Returns all nft tokens generated.
  // near view $CONTRACT nft_tokens '{"from_index": "", "limit": 0}' --accountId $ACCOUNT
  nft_tokens(from_index: string, limit: u64): Token[];

  // Returns number of generated tokens for specified account.
  // near view $CONTRACT nft_supply_for_owner '{"account_id": ""}' --accountId $ACCOUNT
  nft_supply_for_owner(account_id: string): string;

  // Returns all nft tokens generated for specified account.
  // near view $CONTRACT nft_tokens_for_owner '{"account_id": "", "from_index": "", "limit": 0}' --accountId $ACCOUNT
  nft_tokens_for_owner(
    account_id: string,
    from_index: string,
    limit: u64
  ): Token[];
}

export default class NonFungibleToken implements NEP171, NEP177, NEP181 {
  extra_storage_in_bytes_per_token: u64;

  // Initializes required variables metadata etc.
  constructor(name: string, symbol: string) {}
}
```

index.ts

```ts
// Initialize contract with owner id.
export function init(owner_id: string): void;

// Places a bid for specified tokens as much as deposited amount.
// near call $CONTRACT nft_offer_transfer '{"token_id": ""}' --accountId $ACCOUNT --deposit 10 --gas 300000000000000
export function nft_offer_transfer(token_id: string): bool;

// Returns number of generated tokens so far.
// near view $CONTRACT nft_current_supply --accountId $ACCOUNT
export function nft_current_supply(): u32;
```

[loom video]: https://www.loom.com/embed/21dad88d39d740d9b9eda504f03fd63e
[vue]: https://vuejs.org/
[create-near-app]: https://github.com/near/create-near-app
[node.js]: https://nodejs.org/en/download/package-manager/
[jest]: https://jestjs.io/
[near accounts]: https://docs.near.org/docs/concepts/account
[near wallet]: https://wallet.testnet.near.org/
[near-cli]: https://github.com/near/near-cli
[gh-pages]: https://github.com/tschaub/gh-pages
[smart contract]: https://docs.near.org/docs/develop/contracts/overview
[assemblyscript]: https://www.assemblyscript.org/
[create-near-app]: https://github.com/near/create-near-app
[node.js]: https://nodejs.org/en/download/package-manager/
[as-pect]: https://www.npmjs.com/package/@as-pect/cli
[deep ai]: https://deepai.org/
