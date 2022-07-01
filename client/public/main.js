/** Connect to Moralis server */
const serverUrl = "https://9pahilwouybl.usemoralis.com:2053/server";
const appId = "2Gv1uDCXoElW5qnEbbUBxaDuVS7IxzZsjSyzm2Px";
Moralis.start({ serverUrl, appId });

const CONTRACT_ADDRESS = "0xcc44Da1d50A8D186ea8bbed67dF18Ee7fac35795";

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

async function checkLogin() {
    user = Moralis.User.current();
    if (user) {
        connectToContract();
        $('#login').empty();
    }
}
checkLogin();

async function connectToContract() {
    console.log("connectting");

    await Moralis.enableWeb3();
    web3 = new window.Web3(Moralis.provider);

    let abi = await getAbi();
    contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS, user);
    $('#login').empty();
    //TODO: remove hardcode
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

//TODO: hardcode
// logOut();


//test name
async function contractName() {
    let data = await contract.methods.name().call({ from: ethereum.selectedAddress });
    console.log(data);
    document.getElementById("txtMessage").innerText = data;
}

//test balanceOf
async function balanceOf() {
    let data = await contract.methods.balanceOf(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
    console.log(data);
    document.getElementById("txtMessage").innerText = data;
}

//test getAllCardIds
async function getAllCardIds() {
    try {
        let data = await contract.methods.getAllCardIds().call({ from: ethereum.selectedAddress });
        return data;
    }
    catch (e) {
        console.log(e);
        return null;
    }
}


//test getOwnCardIds
async function getOwnCardIds() {
    try {
        let data = await contract.methods.getOwnCardIds(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
        return data;
    }
    catch (e) {
        return null;
    }
}


//test getOwnCollection
async function getOwnCollection() {
    let data = await contract.methods.getOwnCollection(ethereum.selectedAddress).call({ from: ethereum.selectedAddress });
    return data;
}


//test getTokenPrice
async function getTokenPrice() {
    let data = await contract.methods.getTokenPrice(1).call({ from: ethereum.selectedAddress });

    var price = web3.utils.fromWei(data, 'ether');

    console.log(price);
    document.getElementById("txtMessage").innerText = price + ' eth';
}


//test buyCard
async function buyCard(card) {
    // const tx = contract.methods.buyCard();
    // const gas = await tx.estimateGas();
    // const gasPrice = await web3.eth.getGasPrice();
    // const data = tx.encodeABI();
    // const nonce = await web3.eth.getTransactionCount(ethereum.selectedAddress);

    console.log(card)
    const amount = web3.utils.toWei(card.price.toString(), 'ether');

    // console.log(gas)
    // console.log(gasPrice)

    const txData = {
        'from': ethereum.selectedAddress,
        'to': CONTRACT_ADDRESS,
        'data': contract.methods.buyCard(card.id).encodeABI(),
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

//sellCard 
async function sellCard({ id }) {
    await contract.methods.sellCard(id)
        .send({
            from: ethereum.selectedAddress,
            'gas': 1000000,
            'gasPrice': 20000000000,
        });

    window.location.href = '/';
}

// receive Card
async function takePromotionalCard() {
    let data = await contract.methods.takePromotionalCard()
        .send({
            from: ethereum.selectedAddress,
            'gas': 1000000,
            'gasPrice': 20000000000,
        });
    var receiveTokenId = data.events.Approval.returnValues.tokenId;
    return receiveTokenId;
}

var isOpen = false;
checkLogin()
async function openShop() {
    if (isOpen) return;
    const cards = await getAllCardIds();
    if (!cards) return;
    $('#rShop').empty();
    var i = 0;
    while (cards[i]) {
        var cardJson = await fetch(`api/v1/cards/${cards[i]}`, {
            method: 'get', headers: {
                "Content-Type": "application/json",
            }
        })
        const card = await cardJson.json();
        i++;
        $('#rShop').append(`
        <div class="col">
            <div class="card" style="width: 250px; margin-top: 10px">
                <img class="card-img-top" src="${card.image}" alt="${card.name}">
                <div class="card-body">
                    <h5 class="card-title">${card.price} ETH</h5>
                    <button onclick="buyCard({id: ${card.id}, price: ${card.price}})" class="btn btn-primary">Mua</button>
                </div>
            </div>
        </div>`)
    }
    $('#dShop').show();
    openShop = true;
}

async function openCollection() {
    if (!Moralis.User.current())
        await login();
    if (isOpen) return;
    const cards = await getOwnCardIds();
    $('#rCollection').empty();
    var i = 0;
    while (cards && cards[i]) {
        var cardJson = await fetch(`api/v1/cards/${cards[i]}`, {
            method: 'get', headers: {
                "Content-Type": "application/json",
            }
        })
        const card = await cardJson.json();
        i++;
        $('#rCollection').append(`
        <div class="col">
            <div class="card" style="width: 250px; margin-top: 10px">
                <img class="card-img-top" src="${card.image}" alt="${card.name}">
                <div class="card-body">
                    <h5 class="card-title">${card.price} ETH</h5>
                    <button onclick="sellCard({id: ${card.id}})" class="btn btn-primary">Bán</button>
                </div>
            </div>
        </div>`)
    }
    $('#dCollection').show();
    isOpen = true;
}

const buildCards = [];
const botCards = [];
const state = [0, 0, 0, 0, 0];
var isCal = false;
const result = [0, 0, 0, 0, 0];
const stateBot = [0, 0, 0, 0, 0];
var lv = 1;

async function openPlay() {
    if (!Moralis.User.current())
        await login();
    if (isOpen) return;
    const _myCards = await getOwnCardIds();
    if (!_myCards)
        return
    const myCards = [];
    for (var card of _myCards) {
        var cardJson = await fetch(`/api/v1/cards/${card}`, {
            method: 'get',
            headers: {
                "Content-Type": "application/json",
            }
        });
        card = await cardJson.json();
        myCards.push(card);
    }
    var t = await fetch(`/api/v1/getLevel?privateKey=${Moralis.User.current().get('ethAddress')}`, {
        method: 'get',
        headers: {
            "Content-Type": "application/json",
        }
    });
    var lv1 = await t.json();
    lv = lv1.lv;
    if (!myCards || myCards.length < 5) {
        alert('Vui lòng tích đủ 5 thẻ bài!')
        return
    }
    var _cards = await getAllCardIds();
    const cards = [];
    for (var card of _cards) {
        var cardJson = await fetch(`/api/v1/cards/${card}`, {
            method: 'get',
            headers: {
                "Content-Type": "application/json",
            }
        });
        card = await cardJson.json();
        cards.push(card);
    }
    var check = [-1, -1, -1, -1, -1];

    if (lv > 19) lv = 1;
    const min = Math.floor(lv / 10) * 1500;
    const max = (Math.floor(lv / 10) + 1) * 1500;
    var n = 0;
    while (myCards[n])
        n++;
    for (var i = 0; i < 5; i++) {
        var v = true;
        var u;
        while (v) {
            v = false;
            u = Math.floor(Math.random() * n);
            for (var t of check)
                if (t === u)
                    v = true;
        }
        check[i] = u;
        buildCards.push(myCards[u]);
    }
    check = [-1, -1, -1, -1, -1];
    const cards1 = [];
    for (var u = 0; u < cards.length; u++)
        if ((cards[u].attributes[0].value >= min && cards[u].attributes[0].value <= max)
            && (cards[u].attributes[1].value >= min && cards[u].attributes[1].value <= max))
            cards1.push(cards[u])
    console.log(cards1)
    for (var i = 0; i < 5; i++) {
        var v = true;
        var u;
        while (v) {
            v = false;
            u = Math.floor(Math.random() * cards1.length);
            for (var t of check)
                if (t === u)
                    v = true;
        }
        check[i] = u;
        botCards.push(cards1[u]);
    }
    $("#rPlay1").empty();
    $("#rPlay2").empty();
    $("#rPlay3").empty();
    $("#rPlay4").empty();
    $("#rPlay5").empty();
    for (var i = 0; i < 5; i++) {
        $("#rPlay1").append(`
        <div class="col">
            <div class="card" style="width: 200px; margin: auto">
                <img src="./behind.jpg" class="card-img-top" alt="...">
            </div>
        </div>
        `)
        $("#rPlay2").append(`
        <div class="col"> 
            <div class="card" style="width: 200px; margin: auto">
                <div class="card-title" style="text-align: center">Kết quả</div>
            </div>
        </div>
        `)
        $("#rPlay3").append(`
        <div class="col">
            <div class="card" style="width: 200px; margin: auto">
                <img src="${buildCards[i].image}" id="img${i}" class="card-img-top" alt="...">
            </div>
        </div>
        `)
        $("#rPlay4").append(`
        <div class="col"> 
            <div class="card" style="width: 200px; margin: auto">
                <div class="btn-group" role="group" aria-label="Basic example">
                    <button type="button" id="bt${i}1" onclick = "toAtk(${i})" class="btn btn-primary active">Công</button>
                    <button type="button" id="bt${i}2" onclick = "toDef(${i})" class="btn btn-primary inactive">Thủ</button>
                </div>
            </div>
        </div>
        `)
        $("#rPlay5").append(`
        <div class="col"> 
            <div class="card" style="width: 200px; margin: auto">
                <div class="btn-group" role="group" aria-label="Basic example">
                    <button type="button" id="bt${i}l" onclick = "toLeft(${i})" class="btn btn-primary"><i class="fa fa-arrow-left"></i></button>
                    <button type="button" id="bt${i}r" onclick = "toRight(${i})" class="btn btn-primary"><i class="fa fa-arrow-right"></i></button>
                </div>
            </div>
        </div>
        `)
    }
    $("#dPlay").show();
}
function toAtk(i) {
    $('#bt' + i.toString() + '1').addClass('active');
    $('#bt' + i.toString() + '2').removeClass('active').addClass('inactive');
    state[i] = 0;
}

function toDef(i) {
    $('#bt' + i.toString() + '2').addClass('active');
    $('#bt' + i.toString() + '1').removeClass('active').addClass('inactive');
    state[i] = 1;
}

function toLeft(i) {
    if (i == 0) return
    var j = i - 1;
    var t = buildCards[i];
    buildCards[i] = buildCards[j];
    buildCards[j] = t;
    $("#img" + i.toString()).attr("src", buildCards[i].image);
    $("#img" + j.toString()).attr("src", buildCards[j].image);
    var k = state[j];
    if (state[i] == 0)
        toAtk(j);
    else
        toDef(j);
    if (k == 0)
        toAtk(i);
    else
        toDef(i);
}

function toRight(i) {
    if (i == 4) return
    var j = i + 1;
    var t = buildCards[i];
    buildCards[i] = buildCards[j];
    buildCards[j] = t;
    $("#img" + i.toString()).attr("src", buildCards[i].image);
    $("#img" + j.toString()).attr("src", buildCards[j].image);
    var k = state[j];
    if (state[i] == 0)
        toAtk(j);
    else
        toDef(j);
    if (k == 0)
        toAtk(i);
    else
        toDef(i);
}

async function calculator() {
    if (isCal) {
        closeAll();
        return
    }
    for (var i = 0; i < 5; i++) {
        if (botCards[i].attributes[0].value >= botCards[i].attributes[1].value) {
            if (state[i] == 0) {
                if (botCards[i].attributes[0].value > buildCards[i].attributes[0].value)
                    result[i] = -1;
                if (botCards[i].attributes[0].value < buildCards[i].attributes[0].value)
                    result[i] = 1;
                if (botCards[i].attributes[0].value == buildCards[i].attributes[0].value)
                    result[i] = 0;
            }
            else {
                if (botCards[i].attributes[0].value > buildCards[i].attributes[1].value)
                    result[i] = -1;
                if (botCards[i].attributes[0].value < buildCards[i].attributes[1].value)
                    result[i] = 1;
                if (botCards[i].attributes[0].value == buildCards[i].attributes[1].value)
                    result[i] = 0;
            }
        }
        else {
            stateBot[i] = 1;
            if (state[i] == 0) {
                if (botCards[i].attributes[1].value > buildCards[i].attributes[0].value)
                    result[i] = -1;
                if (botCards[i].attributes[1].value < buildCards[i].attributes[0].value)
                    result[i] = 1;
                if (botCards[i].attributes[1].value == buildCards[i].attributes[0].value)
                    result[i] = 0;
            }
            else {
                if (botCards[i].attributes[1].value < buildCards[i].attributes[1].value)
                    result[i] = -1;
                if (botCards[i].attributes[1].value > buildCards[i].attributes[1].value)
                    result[i] = 1;
                if (botCards[i].attributes[1].value == buildCards[i].attributes[1].value)
                    result[i] = 0;
            }
        }
    }
    var t = 0;
    $('#rPlay2').empty();
    $('#rPlay1').empty();
    for (var i = 0; i < 5; i++) {
        t = t + result[i];
        var st1 = 'Thủ';
        if (stateBot[i] == 0)
            var st1 = 'Công';
        var st2 = 'Thắng';
        if (result[i] == 0)
            st2 = 'Hoà'
        else
            if (result[i] < 0)
                st2 = 'Thua'
        $('#rPlay2').append(`
        <div class="col"> 
            <div class="card" style="width: 200px; margin: auto">
                <div class="card-title" style="text-align: center">${st1} <i class="fa fa-arrow-right"></i> ${st2}</div>
            </div>
        </div>
        `);
        $('#rPlay1').append(`
        <div class="col">
            <div class="card" style="width: 200px; margin: auto">
                <img src="${botCards[i].image}" id="img${i}1" class="card-img-top" alt="...">
            </div>
        </div>
        `)
    }
    if (t == 0)
        alert("Hoà");
    if (t < 0)
        alert("Thua");
    if (t > 0) {
        var card = await takePromotionalCard();
        var cardJson = await fetch(`/api/v1/cards/${card}`, {
            method: 'get',
            headers: {
                "Content-Type": "application/json",
            }
        });
        lv++;
        await fetch(`/api/v1/setLevel?privateKey=${Moralis.User.current().get('ethAddress')}&level=${lv}`, {
            method: 'get',
            headers: {
                "Content-Type": "application/json",
            }
        });
        card = await cardJson.json();
        alert(`Thắng\n Bạn nhận được thẻ bài ${card.name}`);
    }
    isCal = true;
}

async function receive() {
    var card = await takePromotionalCard();
    var cardJson = await fetch(`/api/v1/cards/${card}`, {
        method: 'get',
        headers: {
            "Content-Type": "application/json",
        }
    });
    card = await cardJson.json();
    alert(`Bạn nhận được thẻ bài ${card.name}`);
    await fetch(`/api/v1/setTimeReceive?privateKey=${Moralis.User.current().get('ethAddress')}&timeReceive=${current}`,
        {
            method: 'get',
            headers: {
                "Content-Type": "application/json",
            }
        });
    closeAll();
}

function checkIsReceive() {
    current = (new Date()).getTime();
    if (current - time < 1000 * 24 * 60 * 60) {
        const t = 1000 * 24 * 60 * 60 - current + time;
        const h = (Math.floor(t / (60 * 60 * 1000))).toString() + ' giờ '
        const m = (Math.floor((t % (60 * 60 * 1000)) / (60 * 1000))).toString() + ' phút '
        const s = (Math.floor((t % (60 * 1000)) / 1000)).toString() + ' giây '
        $('#timeRemaining').html('còn ' + h + m + s + ' để nhận quà');
    }
    else {
        $('#timeRemaining').html('có để nhận quà');
        $('#btAttend').empty();
        $('#btAttend').append(`
            <button type="button" class="btn btn-primary" style="width: auto; margin-top:100px" onclick="receive()">Nhận quà</button>
        `)
    }
    setTimeout(checkIsReceive, 1000);
}

var time = 0;
var current = 0;

async function openAttend() {
    const timeJSON = await fetch(`/api/v1/getTimeReceive?privateKey=${Moralis.User.current().get('ethAddress')}`,
        {
            method: 'get',
            headers: {
                "Content-Type": "application/json",
            }
        });
    time = await timeJSON.json();
    time = parseInt(time.time);
    $('#dAttend').show();
    checkIsReceive()
}

function closeAll() {
    window.location.href = '/';
}