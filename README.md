# Snowdog Sniper

This project runs a cron job every 5 seconds to check how much liquidity is in the SDOG-MIM LP, and triggers a sell if it passes a given threshold. To set up this project,

- Deploy the seller contract with the proper configurations (set the "recipient" field in the `config.json` to be the account which receives the MIM from the trade) and *afterwards* send all your SDOG to the newly created contract (address will be found in `config.json` as `snowdogSeller` after deployment). This can be done by setting the PRIVATE_KEY env var to be the account which will deploy the contract and execute the trade from the cron server
- Deploy the cron server (via heroku). This can be done (after having heroku installed and being logged in - https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up) by running the following commands in the repo
```shell
heroku create
heroku config:set GAS_PRICE=350
heroku config:set MIN_SELL_LIQUIDITY=25000000
heroku config:set PRIVATE_KEY=0x123.....
heroku config:set PROVIDER_URL=https://api.avax.network/ext/bc/C/rpc
heroku config:set SNOWDOG_SELLER=0x123...
heroku config:set RECIPIENT=0x12..receipients_address_here_for_logs...
git push heroku master
heroku ps:scale web=1
```
This will deploy 
