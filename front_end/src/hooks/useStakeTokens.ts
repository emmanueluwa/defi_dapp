// hooks[like components but more functionality] - will be used in stakeForm to stake tokens
// when stake button clicked, approve and then send 
import { useEffect, useState } from "react" 
import { constants, utils } from "ethers"
import { useEthers, useContractFunction } from "@usedapp/core"
import { Contract } from "@ethersproject/contracts"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import ERC20 from "../chain-info/contracts/MockERC20.json"
import networkMapping from "../chain-info/deployments/map.json"

export const useStakeTokens = (tokenAddress: string) => {
    //approve and then stake --> address, abi, chainId
    const { chainId } = useEthers()
    const { abi } = TokenFarm
    const tokenFarmAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero
    const tokenFarmInterface = new utils.Interface(abi)
    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface)

    //getting token contract
    const erc20ABI = ERC20.abi
    const erc20Interface = new utils.Interface(erc20ABI)
    const erc20Contract = new Contract(tokenAddress, erc20Interface)
    //approve using useContractFunction from usedapp
    const { send: approveErc20Send, state: approveAndStakeErc20State } = 
        useContractFunction(erc20Contract, "approve", {
            transactionName: "Approve ERC20 transfer"
        })
    // stake after appproved
    const approveAndStake = (amount: string) => {
        setAmountToStake(amount)
        return approveErc20Send(tokenFarmAddress, amount)
    }
    //stake
    const { send: stakeSend, state: stakeState } = 
        useContractFunction(tokenFarmContract, "stakeTokens", {
            transactionName: "Stake Tokens",
        })
    //how much user wants to stake
    const [amountToStake, setAmountToStake] = useState("0")
    //useEffect, lets us do something if a variable changes
    // if anything in array changes, useEffect will be triggered
    useEffect(() => {
        if (approveAndStakeErc20State.status === "Success") {
            //stake function
            stakeSend(amountToStake, tokenAddress)
        }
    }, [approveAndStakeErc20State, amountToStake, tokenAddress])

    const [state, setState] = useState(approveAndStakeErc20State)

    useEffect(() => {
        if (approveAndStakeErc20State.status === "Success") {
            setState(stakeState)
        } else {
            setState(approveAndStakeErc20State)
        }
    }, [approveAndStakeErc20State, stakeState])

    return { approveAndStake, state }

}