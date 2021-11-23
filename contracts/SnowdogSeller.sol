//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SnowdogSeller is Ownable {
    address private snowdog;
    address private mim;
    address private snowdogMimLp;
    address private recipient;
    address private joeRouter;

    constructor(
        address _snowdog,
        address _mim,
        address _snowdogMimLp,
        address _joeRouter,
        address _recipient
    ) {
        snowdog = _snowdog;
        mim = _mim;
        snowdogMimLp = _snowdogMimLp;
        joeRouter = _joeRouter;
        recipient = _recipient;
        IERC20(snowdog).approve(joeRouter, type(uint).max);
    }

    function sellSnowdog(uint _minLpMimBalance) public onlyOwner {
        uint mimBalance = IERC20(mim).balanceOf(snowdogMimLp);
        require(mimBalance >= _minLpMimBalance, "LP BALANCE TOO LOW");
        uint snowdogBalance = IERC20(snowdog).balanceOf(address(this));
        address[] memory path;
        path = new address[](2);
        path[0] = snowdog;
        path[1] = mim;
        IUniswapV2Router02(joeRouter).swapExactTokensForTokens(
            snowdogBalance,
            0,
            path,
            recipient,
            block.timestamp
        );
    }
}
