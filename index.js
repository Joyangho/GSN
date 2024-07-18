/*
ETH = 1
Polygon = 137
*/
const Network = 11155111;

(async () => {
})();
var WalletAddress = "";
var WalletBalance = "";
var TokenBalance = "";

contract = new ethers.Contract(ABI, ADDRESS);
contract20 = new ethers.Contract(ABI20, ADDRESS20);
contractCustom = new ethers.Contract(ABIforwarder, ADDRESSforwader);

async function checkAndSwitchNetwork() {
    try {
        const currentNetwork = await window.ethereum.request({ method: 'net_version' });
        if (currentNetwork != Network.toString()) {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0xaa36a7` }]
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error(`네트워크 전환 중 오류 발생: ${error.message}`);
        alert(`네트워크 전환 중 오류 발생: ${error.message}`);
        return false;
    }
}

async function connectWallet() {
    try {
        if (window.ethereum) {
            // 네트워크 확인 및 전환
            const networkSwitched = await checkAndSwitchNetwork();

            // 네트워크 전환이 필요 없었거나 성공적으로 전환된 경우에만 계속 진행
            if (networkSwitched || window.ethereum.networkVersion == Network.toString()) {
                // Ethereum 지갑 연결 요청
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length === 0) {
                    throw new Error("No accounts found");
                }

                // 연결된 지갑의 주소 가져오기
                const address = accounts[0];
                WalletAddress = address;

                // 지갑 주소를 HTML 요소에 표시
                await checkEtherBalance();
                await checkTokenBalance(address);
                document.getElementById("walletAddress").innerText = `연결된 지갑 주소: ${address}`;

                const walletButton = document.querySelector(".btn-connect-wallet");
                walletButton.innerText = "지갑 새로고침";
                walletButton.onclick = refreshWallet;
            }
        } else {
            throw new Error("Ethereum provider is not available");
        }
    } catch (error) {
        console.error(`지갑 연결 실패: ${error.message}`);
        alert(`지갑 연결 실패: ${error.message}`);
    }
}

async function refreshWallet() {
    await connectWallet();
}

async function checkEtherBalance() {
    try {
        window.web3 = new Web3(window.ethereum);

        const etherBalance = await web3.eth.getBalance(WalletAddress);
        const adjustedEtherBalance = web3.utils.fromWei(etherBalance, 'ether');
        document.getElementById("walletBalance").innerText = `ETH 잔고: ${adjustedEtherBalance} ETH`;
    } catch (error) {
        console.error(`ETH 잔고 확인 오류: ${error.message}`);
        alert(`ETH 잔고 확인 오류: ${error.message}`);
    }
}

async function checkTokenBalance(address) {
    try {
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        contract20 = new web3.eth.Contract(ABI20, ADDRESS20);

        const balance = await contract20.methods.balanceOf(address).call();
        const adjustedBalance = balance / 10 ** 18; // 발행량을 10^18로 나눔
        document.getElementById("tokenBalance").innerText = `토큰 잔고: ${adjustedBalance} ESS`;
    } catch (error) {
        console.error(`토큰 잔고 확인 오류: ${error.message}`);
        alert(`토큰 잔고 확인 오류: ${error.message}`);
    }
}

async function TokenAdd() {
    try {
        // Metamask에 연결된 지갑이 없다면 connectWallet 함수 호출
        if (!ethereum.selectedAddress) {
            await connectWallet();
        }

        // Metamask에 추가할 토큰 정보
        const tokenInfo = {
            type: "ERC20", // 토큰 종류 (ERC20, BEP20 등)
            options: {
                address: ADDRESS20, // 토큰의 스마트 컨트랙트 주소
                symbol: "MTK", // 토큰 심볼 (예: ETH, DAI)
                decimals: 18, // 토큰의 소수점 자리수
            },
        };

        // Metamask에 토큰 추가 요청
        await ethereum.request({
            method: 'wallet_watchAsset',
            params: tokenInfo,
        });

        alert("토큰이 메타마스크에 추가되었습니다.");
    } catch (error) {
        console.error("토큰 추가 오류:", error);
        alert("토큰 추가에 실패했습니다. 메타마스크 설정을 확인해주세요.");
    }
}

async function checkBalance() {
    try {
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(ABI20, ADDRESS20);
        const address = document.getElementById("balanceAddress").value;
        const balance = await contract.methods.balanceOf(address).call();
        const adjustebalanceOf = balance / 10 ** 18; // 발행량을 10^18로 나눔

        if (!web3.utils.isAddress(address)) {
            throw new Error("유효하지 않은 주소입니다.");
        }

        document.getElementById("balanceResult").innerText = `잔고: ${adjustebalanceOf} ESS`;
    } catch (error) {
        console.error(error);
        document.getElementById("balanceResult").innerText = `에러: ${error.message}`;
    }
}

async function addRelayer() {
    try {
        // Metamask에 연결된 지갑이 없다면 connectWallet 함수 호출
        if (!ethereum.selectedAddress) {
            await connectWallet();
        }
        // Metamask에 연결된 지갑 요청
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(ABI, ADDRESS);

        // 웹에서 받은 추가 주소 데이터
        const Address = document.getElementById("addRelayerAddress").value.trim();

        if (!web3.utils.isAddress(Address)) {
            throw new Error("유효하지 않은 주소입니다.");
        }

        // 중계자 추가 트랜잭션 실행
        await contract.methods.addRelayer(Address).send({ from: ethereum.selectedAddress });

        document.getElementById("addRelayerResult").innerText = "추가 성공!";
        alert(`중계자 추가가 성공적으로 완료되었습니다!`);
    } catch (error) {
        console.error(error);
        document.getElementById("addRelayerResult").innerText = `에러: ${error.message}`;
    }
}

async function removeRelayer() {
    try {
        // Metamask에 연결된 지갑이 없다면 connectWallet 함수 호출
        if (!ethereum.selectedAddress) {
            await connectWallet();
        }
        // Metamask에 연결된 지갑 요청
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(ABI, ADDRESS);

        // 민팅할 수량과 수신자 주소를 가져옴
        const Address = document.getElementById("removeRelayerAddress").value.trim();

        if (!web3.utils.isAddress(Address)) {
            throw new Error("유효하지 않은 주소입니다.");
        }

        // 민팅 트랜잭션 실행
        await contract.methods.removeRelayer(Address).send({ from: ethereum.selectedAddress });

        document.getElementById("removeRelayerResult").innerText = "추가 성공!";
        alert(`중계자 추가가 성공적으로 완료되었습니다!`);
    } catch (error) {
        console.error(error);
        document.getElementById("removeRelayerResult").innerText = `에러: ${error.message}`;
    }
}

async function relayMetaTransaction() {
    try {
        
        // Metamask에 연결된 지갑이 없다면 connectWallet 함수 호출
        if (!ethereum.selectedAddress) {
            await connectWallet();
        }
        // Ethereum 지갑 연결 요청
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];

        const senderAddress = document.getElementById("metasenderAddress").value;
//        const recipientAddress = document.getElementById("metarecipientAddress").value;
        const recipientAddress = "0xdd98b801d7b953c34400ac50015779a8c6060506";
        const amount = document.getElementById("metaAmount").value;
        const signature = document.getElementById("signature").value;

        if (!window.ethereum) {
            alert("Metamask가 필요합니다.");
            return;
        }

        contract = new web3.eth.Contract(ABI, ADDRESS);

        await contract.methods.relayMetaTransaction(senderAddress, recipientAddress, amount, signature).send({ from: address });

        document.getElementById("relayMetaTransactionResult").innerText = `트랜잭션 전송 성공`;
    } catch (error) {
        console.error(`트랜잭션 전송 실패: ${error.message}`);
        document.getElementById("relayMetaTransactionResult").innerText = `트랜잭션 전송 실패: ${error.message}`;
    }
}

async function signMessage() {
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        const accounts = await web3.eth.getAccounts();
        const ownerAddress = accounts[0];
        const spenderAddress = "0xdd98b801d7b953c34400ac50015779a8c6060506"; // 스펜더 주소
        const amount = document.getElementById("approveAmount").value; // 금액 입력
        const forwarderAddress = ADDRESSforwader; // GaslessTransaction 스마트 계약 주소
        const tokenContractAddress = ADDRESS20; // 사용자가 만든 ERC-20 토큰 주소
        const chainId = await web3.eth.getChainId();

        const domain = {
            name: 'GaslessTransaction',
            version: '1',
            chainId: chainId,  // 체인 ID를 실제 네트워크에 맞게 설정
            verifyingContract: forwarderAddress  // GaslessTransaction 스마트 계약 주소
        };

        const types = {
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' }
            ],
            ApproveRequest: [
                { name: 'verifyingContract', type: 'address' },
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' },
                { name: 'value', type: 'uint256' }
            ]
        };

        const message = {
            verifyingContract: forwarderAddress,
            owner: ownerAddress,
            spender: spenderAddress,
            value: amount
        };

        const data = JSON.stringify({
            types: {
                EIP712Domain: types.EIP712Domain,
                ApproveRequest: types.ApproveRequest
            },
            domain,
            primaryType: 'ApproveRequest',
            message
        });

        try {
            const signature = await web3.currentProvider.request({
                method: 'eth_signTypedData_v4',
                params: [ownerAddress, data],
                from: ownerAddress
            });

            document.getElementById("approvalsenderResult").innerText = `오너 지갑: ${ownerAddress}`;
            document.getElementById("approvalrecipienteResult").innerText = `후원 지갑: ${spenderAddress}`;
            document.getElementById("approvalamountResult").innerText = `승인 수량: ${message.value}`;
            document.getElementById("approvalSignatureResult").innerText = `승인 서명: ${signature}`;
            console.log('Signature:', signature);
        } catch (error) {
            console.error('Error signing message:', error);
        }
    } else {
        alert('MetaMask is not installed!');
    }
}

async function signAndSendGaslessTransaction() {
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        const accounts = await web3.eth.getAccounts();
        const ownerAddress = accounts[0];
        const spenderAddress = "0xdd98b801d7b953c34400ac50015779a8c6060506"; // 스펜더 주소
        const amount = document.getElementById("forwardAmount").value; // 금액 입력
        const forwarderAddress = ADDRESSforwader; // Forwarder 스마트 계약 주소
        const chainId = await web3.eth.getChainId();
        const forwarderContract = new web3.eth.Contract(ABIforwarder, ADDRESSforwader);

        const domain = {
            name: 'GaslessTransaction',
            version: '1',
            chainId: chainId,
            verifyingContract: forwarderAddress
        };

        const types = {
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' }
            ],
            ApproveRequest: [
                { name: 'verifyingContract', type: 'address' },
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' },
                { name: 'value', type: 'uint256' }
            ]
        };

        const message = {
            verifyingContract: forwarderAddress,
            owner: ownerAddress,
            spender: spenderAddress,
            value: amount
        };

        const data = JSON.stringify({
            types: {
                EIP712Domain: types.EIP712Domain,
                ApproveRequest: types.ApproveRequest
            },
            domain,
            primaryType: 'ApproveRequest',
            message
        });

        try {
            const signature = await web3.currentProvider.request({
                method: 'eth_signTypedData_v4',
                params: [ownerAddress, data],
                from: ownerAddress
            });

            const receipt = await forwarderContract.methods.forwardApproveWithSignature(
                forwarderAddress,
                ownerAddress,
                spenderAddress,
                amount,
                signature
            ).send({ from: address[0] });

            console.log('Transaction receipt:', receipt);
        } catch (error) {
            console.error('Error signing message or sending transaction:', error);
        }
    } else {
        alert('MetaMask is not installed!');
    }
}

function toggleCategory(element) {
    const content = element.nextElementSibling;
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        element.innerHTML = element.innerHTML.replace("&#9662;", "&#9652;");
    } else {
        content.style.display = "none";
        element.innerHTML = element.innerHTML.replace("&#9652;", "&#9662;");
    }
}

// 초기화 시 모든 카테고리 내용을 숨김
document.addEventListener("DOMContentLoaded", function () {
    const categories = document.querySelectorAll(".category-content");
    categories.forEach(category => category.style.display = "none");
});

// ForwardRequest 생성
async function createForwardRequest() {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.enable();

    const forwarderContract = ADDRESScustom;
    const accounts = await web3.eth.getAccounts();
    const ownerAddress = accounts[0];
    const targetAddress = "0xdd98b801d7b953c34400ac50015779a8c6060506"; // 스펜더 주소
    const amount = document.getElementById("approveAmount").value; // 금액 입력
    const functionData = web3.eth.abi.encodeFunctionCall({
        name: 'approveWithSignature',
        type: 'function',
        inputs: [
            { type: 'uint256', name: 'param1' },
            { type: 'string', name: 'param2' }
        ]
    }, [param1Value, param2Value]);

    const nonce = await forwarderContract.methods.getNonce(accounts).call();
    const chainId = await web3.eth.getChainId();
    const domainSeparator = await forwarderContract.methods.DOMAIN_SEPARATOR().call();
    const typehash = await forwarderContract.methods.TYPEHASH().call();

    const request = {
        from: ownerAddress,
        to: targetAddress,
        value: '0',
        gas: '100000',
        nonce: nonce.toString(),
        data: functionData
    };

    // EIP-712 구조체 해시 생성
    const structHash = web3.utils.soliditySha3(
        { t: 'bytes32', v: typehash },
        { t: 'address', v: request.from },
        { t: 'address', v: request.to },
        { t: 'uint256', v: request.value },
        { t: 'uint256', v: request.gas },
        { t: 'uint256', v: request.nonce },
        { t: 'bytes32', v: web3.utils.soliditySha3(request.data) }
    );

    const domainData = {
        name: 'Forwarder',
        version: '1',
        chainId: chainId,
        verifyingContract: forwarderAddress
    };

    const domainSeparatorHash = web3.utils.soliditySha3(
        { t: 'bytes32', v: web3.utils.soliditySha3('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)') },
        { t: 'bytes32', v: web3.utils.soliditySha3(domainData.name) },
        { t: 'bytes32', v: web3.utils.soliditySha3(domainData.version) },
        { t: 'uint256', v: domainData.chainId },
        { t: 'address', v: domainData.verifyingContract }
    );

    const digest = web3.utils.soliditySha3(
        { t: 'bytes1', v: '0x19' },
        { t: 'bytes1', v: '0x01' },
        { t: 'bytes32', v: domainSeparatorHash },
        { t: 'bytes32', v: structHash }
    );

    const signature = sigUtil.signTypedMessage(
        ethUtil.toBuffer(privateKey),
        {
            data: {
                types: {
                    EIP712Domain: [
                        { name: 'name', type: 'string' },
                        { name: 'version', type: 'string' },
                        { name: 'chainId', type: 'uint256' },
                        { name: 'verifyingContract', type: 'address' }
                    ],
                    ForwardRequest: [
                        { name: 'from', type: 'address' },
                        { name: 'to', type: 'address' },
                        { name: 'value', type: 'uint256' },
                        { name: 'gas', type: 'uint256' },
                        { name: 'nonce', type: 'uint256' },
                        { name: 'data', type: 'bytes' }
                    ]
                },
                domain: domainData,
                primaryType: 'ForwardRequest',
                message: request
            }
        }
    );

    console.log("Tuple format for Remix:");
    console.log(`(${request.from}, ${request.to}, ${request.value}, ${request.gas}, ${request.nonce}, ${request.data})`);
    console.log("Signature for Remix:");
    console.log(signature);

    return { request, signature };
}