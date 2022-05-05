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
[ -z "$OWNER" ] && export OWNER=$ACCOUNT && echo "OWNER variable not found and set as ACCOUNT. You can always change OWNER environment variable."
echo "Reading all tokens for specified owner..."
echo "-----------------------------"
echo \n

near view $CONTRACT nft_tokens_for_owner '{"account_id": "'"$OWNER"'", "from_index": "0", "limit": "0"}' --accountId $ACCOUNT