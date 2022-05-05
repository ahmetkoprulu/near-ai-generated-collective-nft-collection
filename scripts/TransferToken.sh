[ -z "$TOKEN_ID" ] && echo "TOKEN_ID should be set to id desired to be viewed." && exit 1
[ -z "$RECEIVER" ] && echo "RECEIVER should be set to id desired to be transfered." && exit 1

echo "-----------------------------\n"
echo "Deploying contract..."
echo "-----------------------------\n"

rm -rf ./neardev
yarn prestart
read TEMP_CONTRACT_NAME < ../neardev/dev-account

echo \n
echo "-----------------------------"
echo "Contract deployed to $TEMP_CONTRACT_NAME"
[ -z "$ACCOUNT" ] && export ACCOUNT=$TEMP_CONTRACT_NAME && echo "ACCOUNT variable not found and set as CONTRACT. You can always change ACCOUNT environment variable."
echo "Transfering specified token..."
echo "-----------------------------\n"

near call $CONTRACT nft_transfer '{"receiver_id": "'"$RECEIVER"'", "token_id": "'"$TOKEN_ID"'", "approval_id": "", "memo": ""}' --accountId $ACCOUNT --gas 300000000000000
