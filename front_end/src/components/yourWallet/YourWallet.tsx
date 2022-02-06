import { Token } from "../Main"
import React, { useState } from "react"
import { Box } from '@material-ui/core'
import { Tab } from '@material-ui/core'
import { TabContext, TabList, TabPanel } from "@material-ui/lab"
import {  WalletBalance  } from "./WalletBalance"
import { StakeForm } from "./StakeForm"

interface YourWalletProps {
    supportedTokens: Array<Token>
}

//we need to know which tokens are supported
export const YourWallet = ({ supportedTokens }: YourWalletProps) => {
    //using state hook to select a token
    //useState--> saving state between renders of a component
    const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setSelectedTokenIndex(parseInt(newValue))
    }

    return (
      <Box>
          <h1> Your Wallet </h1>
          <Box>
              <TabContext value={selectedTokenIndex.toString()}>
                    <TabList onChange={handleChange} aria-label="stake form tabs">
                            {supportedTokens.map((token, index) => {
                                return (
                                    <Tab label={token.name}
                                        value={index.toString()}
                                        key={index} />
                                    )
                            })}
                    </TabList>
                    {supportedTokens.map((token, index) => {
                        return(
                            <TabPanel value={index.toString()} key={index}>
                                <div>
                                    <WalletBalance token={supportedTokens[selectedTokenIndex]}/>
                                    <StakeForm token={supportedTokens[selectedTokenIndex]}/>
                                </div>
                            </TabPanel>
                        )
                    })}
              </TabContext>
          </Box>
      </Box>
      )
}