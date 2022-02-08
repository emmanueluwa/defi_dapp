import React, {useState, useEffect} from "react"
import { Token } from "../Main"
import { useEthers, useTokenBalance, useNotifications } from "@usedapp/core"
import { formatUnits } from "@ethersproject/units"
import { Button, Input, CircularProgress } from "@material-ui/core"
import { useStakeTokens } from "../../hooks"
import { utils } from "ethers"

export interface StakeFormProps {
    token: Token
}

export const StakeForm = ({ token }: StakeFormProps) => {
    const { address: tokenAddress, name } = token
    const { account } = useEthers()
    const tokenBalance = useTokenBalance(tokenAddress, account)
    const formattedTokenBalance: number = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)) : 0
    const { notifications } = useNotifications()

    // state hook used to keept track amount typed in
    const [amount, setAmount] = useState<number | string | Array<number | string>>(0)
    // using event to set amount to input amount 
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? "" : Number(event.target.value)
        setAmount(newAmount)
        console.log(newAmount)
    }

    const { approveAndStake, state: approveAndStakeErc20State } = useStakeTokens(tokenAddress)
    //function for stake button
    const handleStakeSubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString())
        return approveAndStake(amountAsWei.toString())
    }

    //showing status of staking in ui
    const isMining = approveAndStakeErc20State.status === "Mining"

    useEffect(() => {
        if (notifications.filter(
            (notification) => 
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Approve ERC20 transfer").length > 0) {
            console.log("Approved") 
                }
        if (notifications.filter(
            (notification) =>
                notification.type == "transactionSucceed" &&
                notification.transactionName == "Stake Tokens"
        ).length > 0) {
            console.log("Tokens Staked")
        }
    }, [notifications])

    return (
        <>
        <div>
            <Input onChange={handleInputChange} />
            <Button onClick={handleStakeSubmit}
                    color="primary"
                    size="large"
                    disabled={isMining}>
                        {isMining ? <CircularProgress size={26} /> : "Stake"}
            </Button>
        </div>
        </>
    )
}