// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract Forwarder is EIP712, Context, BaseRelayRecipient, Ownable(msg.sender) {
    using ECDSA for bytes32;

    string private constant SIGNING_DOMAIN = "GaslessTransaction";
    string private constant SIGNATURE_VERSION = "1";
    
    event DebugInfo(address owner, address recipient, uint256 amount);
    event CallSuccess(bool success);
    
    constructor() EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {}

    function forwardTransferFromWithSignature(
        address gaslessTransaction,
        address owner,
        address recipient,
        uint256 amount,
        bytes memory signature
    ) public {

        bytes32 structHash = keccak256(abi.encode(
            keccak256("TransferFromRequest(address verifyingContract,address owner,address recipient,uint256 amount)"),
            address(this),
            owner,
            recipient,
            amount
        ));
        
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(signature);
        require(signer == owner, "Invalid signature");

        // 디버깅: 인자 출력
        emit DebugInfo(owner, recipient, amount);
        
        (bool success,) = gaslessTransaction.call(
            abi.encodeWithSignature("transferFromWithSignature(address,address,uint256,bytes)", owner, recipient, amount, signature)
        );
        require(success, "Call to GaslessTransaction failed");

        // 디버깅: 호출 성공 여부 출력
        emit CallSuccess(success);
    }

    function versionRecipient() external virtual view override returns (string memory) {
        return "1";
    }

    function _msgSender() internal view override(Context, BaseRelayRecipient) returns (address) {
        return BaseRelayRecipient._msgSender();
    }

    function _msgData() internal view override(Context, BaseRelayRecipient) returns (bytes calldata) {
        return BaseRelayRecipient._msgData();
    }
}
