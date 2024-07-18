// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Token Test 0xddE0B08daCF455De705F57719BD97559b6a640c0 Sepolia
contract GaslessTransaction is EIP712, BaseRelayRecipient, Ownable(msg.sender) {
    using ECDSA for bytes32;

    IERC20 public token;
    string private constant SIGNING_DOMAIN = "GaslessTransaction";
    string private constant SIGNATURE_VERSION = "1";    

    struct TransferFromRequest {
        address forwarder;
        address owner;
        address recipient;
        uint256 amount;
    }

    bytes32 private constant _TRANSFERFROM_TYPEHASH = keccak256("TransferFromRequest(address owner,address recipient,uint256 amount)");

    event TransferFrom(address indexed owner, address indexed recipient, uint256 amount);
    event Debug(string message, address recipient, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event VerifiedSignerSet(address indexed setter, address indexed signer);

    constructor(address tokenAddress, address trustedForwarder) 
        EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        token = IERC20(tokenAddress);
        _setTrustedForwarder(trustedForwarder);
    }

    function versionRecipient() external pure override returns (string memory) {
        return "1";
    }

    function transferFromWithSignature(
        address owner,
        address recipient,
        uint256 amount,
        bytes memory signature
    ) public {
        
        // 서명 검증 추가
        bytes32 structHash = keccak256(abi.encode(
            keccak256("TransferFromRequest(address owner,address recipient,uint256 amount)"),
            owner,
            recipient,
            amount
        ));
        
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(signature);
        require(signer == owner, "Invalid signature");

        emit Debug("Before transfer", recipient, amount);

        (bool success,) = address(token).call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", owner, recipient, amount)
        );
        require(success, "Transfer failed");

        emit Debug("After transfer", recipient, amount);

        emit TransferFrom(owner, recipient, amount);
    }

    function getAllowance(address owner, address spender) public view returns (uint256) {
        return token.allowance(owner, spender);
    }

    function _msgSender() internal view override(Context, BaseRelayRecipient) returns (address) {
        return BaseRelayRecipient._msgSender();
    }

    function getCurrentSender() public view returns (address) {
        return _msgSender();
    }

    function _msgData() internal view override(Context, BaseRelayRecipient) returns (bytes calldata) {
        return BaseRelayRecipient._msgData();
    }
}
