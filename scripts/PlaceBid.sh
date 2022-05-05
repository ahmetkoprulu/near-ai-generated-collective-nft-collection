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
echo "Placing 10 NEAR bid for specified token..."
echo "-----------------------------"
echo \n

near call $CONTRACT nft_offer_transfer '{"token_id": "'"$TOKEN_ID"'"}' --accountId $ACCOUNT --deposit 10 --gas 300000000000000