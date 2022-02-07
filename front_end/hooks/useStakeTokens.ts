// hooks[like components but more functionality] - will be used in stakeForm to stake tokens
// when stake button clicked, approve and then send 
import { constants, utils } from "ethers"
import { useEthers } from "@usedapp/core"
import { Contract } from "@ethersproject/contracts"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import ERC20 from "../chain-info/contracts/.json"
import { networkMapping } from "../chain-info/deployments/map.json"

export const useStakeTokens = () => {
    //approve and then stake --> address, abi, chainId
    const { chainId } = useEthers()
    const { abi } = TokenFarm
    const tokenfarmAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero
    const tokenfarmInterface = new utils.Interface(abi)
    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface)

    //working with token contract

}