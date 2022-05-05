[ -z "$TOKEN_ID" ] && echo "TOKEN_ID should be set to id desired to be viewed." && exit 1

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
echo "Reading specified token..."
echo "-----------------------------"
echo \n

near view $CONTRACT nft_token --accountId $ACCOUNT '{"token_id": "'"$TOKEN_ID"'"}'