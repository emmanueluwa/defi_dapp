import { makeStyles } from "@material-ui/core"

const useStyles = makeStyles(theme=> ({
    container: {
        display: "inline-grid",
        gridTemplateColumns: "auto auto auto",
        gap: theme.spacing(1),
        alignItems: "center"
    },
    tokenImage: {
        width: "32px"
    },
    amount: {
        fontWeight: 700
    }
}))

interface BalanceMessageProps {
    label:  string
    amount: number
    tokenImageSource:  string
}

export const BalanceMessage = ({label, tokenImageSource, amount}: BalanceMessageProps) => {
    const classes = useStyles()

    return (
        <div className={classes.container}>
            <div>{label}</div>
            <div className={classes.amount}>{amount}</div>
            <img className={classes.tokenImage} src={tokenImageSource} alt="token log"/>
        </div>
    )

    
}