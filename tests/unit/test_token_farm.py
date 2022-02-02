#TESTS SHOULD ALSO BE WRITTEN FOR indicidual TOKENS
from brownie import network
from scripts.helpful_scripts import LOCAL_BLOCKCHAIN_ENVIRONMENTS, get_account, get_contract
import pytest 
from scripts.deploy import deploy_token_farm_and_dapp_token

def test_set_price_feed_contract():
    #we want unit tests to be performed on the local network
    #arrange 
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    non_owner = get_account(index=1)
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    # act
    ## we can use get_contract to get an address, brownie will understand
    price_feed_address = get_contract("eth_usd_price_feed")
    token_farm.setPriceFeedContract(dapp_token.address, price_feed_address, {"from": account})
    #assert
    ## this mapping maps and address to an address
    assert token_farm.tokenPriceFeedMapping(dapp_token.address) == price_feed_address
