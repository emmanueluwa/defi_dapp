from scripts.helpful_scripts import get_account, get_contract
from brownie import DappToken, TokenFarm, network, config
from web3 import Web3

KEPT_BALANCE = Web3.toWei(100, "ether")

def deploy_token_farm_and_dapp_token():
    account = get_account()
    dapp_token = DappToken.deploy({"from": account})
    token_farm = TokenFarm.deploy(dapp_token.address, {"from":account}, publish_source=config["networks"][network.show_active()].get("verify", False))
    #send token farm close to 100% of token so it has amount to give as reward
    transaction = dapp_token.transfer(token_farm.address, dapp_token.totalSupply() - KEPT_BALANCE, {"from": account})
    transaction.wait(1)
    # add tokens that are allowed and give associated pricefeed
    #tokens allowed with this farm:dapp_token, weth_token, fau_token(pretend this is DAI)
    weth_token = get_contract("weth_token") #matching with config
    fau_token = get_contract("fau_token")
    ## if the weth token and fau token addresses are not present then deploy a mock
    dict_of_allowed_tokens = {
            dapp_token: get_contract("dai_usd_price_feed"),
            fau_token: get_contract("dai_usd_price_feed"),
            weth_token: get_contract("eth_usd_price_feed")
    } #dict passed to allowed tokens, allows equal value in contract
    add_allowed_tokens(token_farm, dict_of_allowed_tokens, account)
    return token_farm, dapp_token



def add_allowed_tokens(token_farm, dict_of_allowed_tokens, account):
    #loop through allowed tokens and use function in token_farm contract to add them
    for token in dict_of_allowed_tokens:
        add_transaction = token_farm.addAllowedTokens(token.address, {"from": account})
        add_transaction.wait(1)
        set_transaction = token_farm.setPriceFeedContract(
            token.address, dict_of_allowed_tokens[token], {"from": account}
        )
        set_transaction.wait(1)
    return token_farm


def main():
    deploy_token_farm_and_dapp_token()
