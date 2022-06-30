/** Connect to Moralis server */
const serverUrl = "https://9pahilwouybl.usemoralis.com:2053/server";
const appId = "2Gv1uDCXoElW5qnEbbUBxaDuVS7IxzZsjSyzm2Px";
Moralis.start({ serverUrl, appId });

const CONTRACT_ADDRESS = "0xb9a22dAF5712E89d55f395A1B24391C1f62d41f7";

let user = null;
let web3 = null;
let contract = null;

/** Add from here down */
async function login() {
    console.log("connectting");
    user = Moralis.User.current();
    if (!user) {
        try {
            user = await Moralis.authenticate({ signingMessage: "Login successful!" })
            console.log(user)
            console.log(user.get('ethAddress'))

        } catch (error) {
            console.log(error)
        }
    }

    connectToContract();
}

async function connectToContract() {
    console.log("connectting");

    await Moralis.enableWeb3();
    web3 = new window.Web3(Moralis.provider);

    let abi = await getAbi();
    contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS, user);

    //TODO: remove hardcode
    document.getElementById("btnLogin").style.visibility = "hidden";
    document.getElementById("txtMessage").style.visibility = "visible";
    document.getElementById("txtMessage").innerText = "Dang nhap thanh cong";
}

async function logOut() {
    await Moralis.User.logOut();
    console.log("logged out");
}

function getAbi() {
    return new Promise((res) => {
        $.getJSON("Token.json", ((json) => {
            res(json.abi);
        }))
    });
}

document.getElementById("btnLogin").onclick = login;

//TODO: hardcode
logOut();


//test name
document.getElementById("btnContractName").onclick = contractName;
async function contractName() {
    let data = await contract.methods.name().call({ from: ethereum.selectedAddress });
    console.log(data);
    document.getElementById("txtMessage").innerText = data;
}

//test balanceOf
document.getElementById("btnbalanceOf").onclick = balanceOf;
async function balanceOf() {
    let data = await contract.methods.balanceOf(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
    console.log(data);
    document.getElementById("txtMessage").innerText = data;
}


//test getAllCardIds
document.getElementById("btngetAllCardIds").onclick = getAllCardIds;
async function getAllCardIds() {
    console.log('getAllCardIds')
    let data = await contract.methods.getAllCardIds().call({ from: ethereum.selectedAddress });
    console.log(data);
    console.log('getAllCardIds')
    document.getElementById("txtMessage").innerText = data;
}


//test getOwnCardIds
document.getElementById("btngetOwnCardIds").onclick = getOwnCardIds;
async function getOwnCardIds() {
    let data = await contract.methods.getOwnCardIds(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
    console.log(data);
    document.getElementById("txtMessage").innerText = data;
}


//test getOwnCollection
document.getElementById("btngetOwnCollection").onclick = getOwnCollection;
async function getOwnCollection() {
    let data = await contract.methods.getOwnCollection(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
    console.log(data);
    document.getElementById("txtMessage").innerText = data;
}


//test getTokenPrice
document.getElementById("btngetTokenPrice").onclick = getTokenPrice;
async function getTokenPrice() {
    let data = await contract.methods.getTokenPrice(1).call({ from: ethereum.selectedAddress });

    var price = web3.utils.fromWei(data, 'ether');

    console.log(price);
    document.getElementById("txtMessage").innerText = price + ' eth';
}


//test buyCard
document.getElementById("btnbuyCard").onclick = buyCard;
async function buyCard() {
    // const tx = contract.methods.buyCard();
    // const gas = await tx.estimateGas();
    // const gasPrice = await web3.eth.getGasPrice();
    // const data = tx.encodeABI();
    // const nonce = await web3.eth.getTransactionCount(ethereum.selectedAddress);

    const amount = web3.utils.toWei('0.295', 'ether');

    // console.log(gas)
    // console.log(gasPrice)

    const txData = {
        'from': ethereum.selectedAddress,
        'to': CONTRACT_ADDRESS,
        'data': contract.methods.buyCard(1).encodeABI(),
        'gas': 1000000,
        'gasPrice': 20000000000,
        'value': amount,
        // 'nonce': nonce,
    };

    const receipt = web3.eth.sendTransaction(txData, function (error, hash) {
        if (error) {
            console.log(`error : ${JSON.stringify(error)}`);
        }

        if (hash) {
            console.log(`transaction hash : ${JSON.stringify(hash)}`);
        }
    });
}


//test takePromotionalCard
document.getElementById("btntakePromotionalCard").onclick = takePromotionalCard;
async function takePromotionalCard() {
    let data = await contract.methods.takePromotionalCard()
        .send({
            from: ethereum.selectedAddress,
            'gas': 1000000,
            'gasPrice': 20000000000,
        });
    var receiveTokenId = data.events.Approval.returnValues.tokenId;
    console.log(receiveTokenId);
    document.getElementById("txtMessage").innerText = receiveTokenId;
}