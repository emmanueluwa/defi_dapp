#TESTS SHOULD ALSO BE WRITTEN FOR indicidual TOKENS
from brownie import network, exceptions
from scripts.helpful_scripts import LOCAL_BLOCKCHAIN_ENVIRONMENTS, get_account, get_contract, INITIAL_PRICE_FEED_VALUE
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
    ##making sure someone else cannot deploy this function
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.setPriceFeedContract(
            dapp_token.address, price_feed_address, {"from": non_owner}
        )

def test_stake_tokens(amount_staked):
    #arrange 
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    # act
    dapp_token.approve(token_farm.address, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, dapp_token.address, {"from": account})
    # assert
    assert {
        ##stakingBalance is a mapping of a mapping for addresses, so we pass 2 params
        token_farm.stakingBalance(dapp_token.address, account.address) == amount_staked
    }
    assert token_farm.uniqueTokensStaked(account.address) == 1
    assert token_farm.stakers(0) == account.address
    ## allowing us to use tokens that have been staked in test_issue_tokens
    return token_farm, dapp_token

def test_issue_tokens(amount_staked):
    ##first stake tokens
    #arrange 
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)
    starting_balance = dapp_token.balanceOf(account.address)
    #act
    token_farm.issueTokens({"from": account})
    # arrange
    ## 1 dapp_token is being staked and this equals 1 eth
    ## price of eth in helpfulscripts is 2000, so we get 2000 dapps
    assert (
        dapp_token.balanceOf(account.address) == starting_balance + INITIAL_PRICE_FEED_VALUE
    )


