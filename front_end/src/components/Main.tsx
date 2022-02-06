import { useEthers } from '@usedapp/core'
import helperConfig from "../helper-config.json"
import networkMapping from "../chain-info/deployments/map.json"
import { constants } from 'ethers'
import brownieConfig from "../brownie-config.json"
import dapp from "../dapp.png"
import dai from "../dai.png"
import eth from "../eth.png"
import { YourWallet } from "./yourWallet"


export type Token = {
    image: string
    address: string
    name: string
}

export const Main = () => {
    //1.token values from wallet 2.address of dif tokens 3.balance of users wallet
    //send brownie-config to src folder, send build folder
    const { chainId } = useEthers()
    //chainId needs to be mapped to name of network like in brownie config
    const networkName = chainId ? helperConfig[chainId] : "dev"
    
    const dappTokenAddress = chainId ? networkMapping[String(chainId)]["DappToken"][0] : constants.AddressZero //if not, zero address from ethers
    const wethTokenAddress = chainId ? brownieConfig["networks"][networkName]["weth_token"] : constants.AddressZero
    const fauTokenAddress = chainId ? brownieConfig["networks"][networkName]["fau_token"] : constants.AddressZero

    const supportedTokens: Array<Token> = [
        {
            image: dapp,
            address: dappTokenAddress,
            name: "DAPP"
        },
        {
            image: eth,
            address: fauTokenAddress,
            name: "WETH"
        },
        {
            image: dai,
            address: fauTokenAddress,
            name: "DAI"
        }

    ]

    return (<YourWallet supportedTokens={supportedTokens} />)
}