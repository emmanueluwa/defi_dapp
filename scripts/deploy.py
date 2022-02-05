from scripts.helpful_scripts import get_account, get_contract
from brownie import DappToken, TokenFarm, network, config
from web3 import Web3
import yaml
import json
import os
import shutil

KEPT_BALANCE = Web3.toWei(100, "ether")

def deploy_token_farm_and_dapp_token(front_end_update=False):
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
    if front_end_update:
        update_front_end()
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

def update_front_end():
    #this function works because frontend is in this folder, for real app addresses will be... 
    #avail to be used in front end code
    ##we need to send the build folder
    copy_folders_to_front_end("./build", "./front_end/src/chain-info")

    ##we need to convert yaml to json then dump it into front end 
    with open("brownie-config.yaml", "r") as brownie_config:
        config_dict = yaml.load(brownie_config, Loader=yaml.FullLoader)
        #send as json object to front end 
        with open("./front_end/src/brownie-config.json", "w") as brownie_config_json:
            json.dump(config_dict, brownie_config_json)
    print("Front end update")

def copy_folders_to_front_end(source, destination):
    #if build folder exists
    if os.path.exists(destination):
        ##delete everything there
        shutil.rmtree(destination)
    #copy folder to front end
    shutil.copytree(source, destination)


def main():
    deploy_token_farm_and_dapp_token(front_end_update=True)
