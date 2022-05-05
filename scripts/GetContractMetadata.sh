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
echo "Reading contract metadata..."
echo "-----------------------------"
echo \n

near view $TEMP_CONTRACT_NAME nft_metadata --accountId $ACCOUNT