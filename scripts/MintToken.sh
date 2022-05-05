echo \n
echo "-----------------------------"
echo "Deploying contract..."
echo "-----------------------------"
echo \n

rm -rf ./neardev
yarn prestart
read TEMP_CONTRACT_NAME < ../neardev/dev-account

echo \n
echo "-----------------------------"
echo "Contract deployed to $TEMP_CONTRACT_NAME"
[ -z "$ACCOUNT" ] && export ACCOUNT=$TEMP_CONTRACT_NAME && echo "ACCOUNT variable not found and set as CONTRACT. You can always change ACCOUNT environment variable."
echo "Minting token..."
echo "-----------------------------"
echo \n

TOKEN_METADATA='{
            "title": "264ef705-df55-4c94-89d2-74aa9fa4705a",
            "description": "AI generated image.",
            "media": "https://some-url.com",
            "media_hash": "",
            "copies": 1,
            "issued_at": 0,
            "expires_at": 0,
            "starts_at": 0,
            "updated_at": 0,
            "extra": "",
            "reference": "",
            "reference_hash": ""
          }'
TEMP_TOKEN_ID=$RANDOM
near call $TEMP_CONTRACT_NAME nft_mint '{"token_id": "'"$TEMP_TOKEN_ID"'","receiver_id": "'"$ACCOUNT"'","token_metadata": '"$TOKEN_METADATA"'}' --accountId $ACCOUNT --deposit 1 --gas 300000000000000
