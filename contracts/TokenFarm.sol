// Aims: stakeTokens, unStake tokens
//       issueTokens, aaAllowedTokens, getEthValue
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract TokenFarm is Ownable {
    //keeping track of the amount of each token user has sent to be staked
    // mapping token address --> staker address --> amount
    mapping(address => mapping(address => uint256)) public stakingBalance;

    //determining if user should be added to stake list
    mapping(address => uint256) public uniqueTokensStaked;

    //token address to its pricefeed address
    mapping(address => address) public tokenPriceFeedMapping;

    //list of stakers
    address[] public stakers;

    address[] public allowedTokens;

    IERC20 public dappToken;

    //we need to know the address of the dapp token as soon as token is deployed
    constructor(address _dappTokenAddress) public {
        dappToken = IERC20(_dappTokenAddress);
    }

    // issuing token = token given as reward, giving 1:1 ratio of DappToken return
    function issueTokens() public onlyOwner {
        //listing through list of stakers
        for (
            uint256 stakersIndex = 0;
            stakersIndex < stakers.length;
            stakersIndex++
        ) {
            address recipient = stakers[stakersIndex];
            uint256 userTotalValue = getUserTotalValue(recipient);
            // send them a token reward, based on user total value worth of tokens locked in
            dappToken.transfer(recipient, userTotalValue);
        }
    }

    //it is more gas efficient to get users to request tokens, here we will auto send them out for better user exp.
    function getUserTotalValue(address _user) public view returns (uint256) {
        uint256 totalValue = 0;
        require(uniqueTokensStaked[_user] > 0, "No tokens staked yet");
        //loop through allowed token to get amount for each user
        for (
            uint256 allowedTokensIndex = 0;
            allowedTokensIndex < allowedTokens.length;
            allowedTokensIndex++
        ) {
            // we need to find the total value of one individual token
            totalValue =
                totalValue +
                getUserSingleTokenValue(
                    _user,
                    allowedTokens[allowedTokensIndex]
                );
        }
        return totalValue;
    }

    //set pricefeed associated w token, map tokens to pricefeed
    function setPriceFeedContract(address _token, address _priceFeed)
        public
        onlyOwner
    {
        tokenPriceFeedMapping[_token] = _priceFeed;
    }

    function getUserSingleTokenValue(address _user, address _token)
        public
        view
        returns (uint256)
    {
        // e.g if 1 eth --> $2,000 then return 2000
        if (uniqueTokensStaked[_user] <= 0) {
            return 0;
        }
        // token value = price of token * stakingBalance[_token][user]
        (uint256 price, uint256 decimals) = getTokenValue(_token);
        // if 10eth and eth/usd is 100 then, we have 10 * 100$ worth of eth, devide by decimals
        return ((stakingBalance[_token][_user] * price) / (10**decimals));
    }

    function getTokenValue(address _token)
        public
        view
        returns (uint256, uint256)
    {
        // working w chainlink pricefeeds, map each token to its associated pricefeed address
        address priceFeedAddress = tokenPriceFeedMapping[_token];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            priceFeedAddress
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // we need the decimals of each price so we can match the units, decimals returns uint8 so wrap it
        uint256 decimals = uint256(priceFeed.decimals());
        return (uint256(price), decimals);
    }

    function stakeTokens(uint256 _amount, address _token) public {
        // which tokens can be added to stake? How much can they stake?
        require(_amount > 0, "Amount must be more than 0");
        require(tokenIsAllowed(_token), "Token is not currently allowed");
        // calling trasferFrom function from ERC20, wrap token address as erc20 token
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        //adding user to stake list if new, e.g if user has more than one unique token then they are already in list
        updateUniqueTokensStaked(msg.sender, _token);
        //adding to the balance user had previously
        stakingBalance[_token][msg.sender] =
            stakingBalance[_token][msg.sender] +
            _amount;
        //if user not on list add to stakers list
        if (uniqueTokensStaked[msg.sender] == 1) {
            stakers.push(msg.sender);
        }
    }

    function unstakeTokens(address _token) public {
        uint256 balance = stakingBalance[_token][msg.sender];
        require(balance > 0, "Staking balance cannot be 0");
        //sending tokens back to user(user withdraws)
        IERC20(_token).transfer(msg.sender, balance);
        stakingBalance[_token][msg.sender] = 0;
        uniqueTokensStaked[msg.sender] = uniqueTokensStaked[msg.sender] - 1;
    }

    function updateUniqueTokensStaked(address _user, address _token) internal {
        if (stakingBalance[_token][_user] <= 0) {
            uniqueTokensStaked[_user] = uniqueTokensStaked[_user] + 1;
        }
    }

    function addAllowedTokens(address _token) public onlyOwner {
        allowedTokens.push(_token);
    }

    function tokenIsAllowed(address _token) public returns (bool) {
        for (
            uint256 allowedTokensIndex = 0;
            allowedTokensIndex < allowedTokens.length;
            allowedTokensIndex++
        ) {
            if (allowedTokens[allowedTokensIndex] == _token) {
                return true;
            }
        }
        return false;
    }
}
