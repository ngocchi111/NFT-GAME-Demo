var isOpen = false;
checkLogin()
async function openShop(){
    if (isOpen) return;
    const resJSON =await fetch('/api/v1/cards',{
        method: 'get',
        headers: {
            "Content-Type": "application/json",
        }
    });
    const cards = await resJSON.json();
    $('#rShop').empty();
    var i = 0;
    while (cards[i]) {
        card = cards[i];
        i++;
        $('#rShop').append(`
        <div class="col">
            <div class="card" style="width: 250px; margin-top: 10px">
                <img class="card-img-top" src="${card.image}" alt="${card.name}">
                <div class="card-body">
                    <h5 class="card-title">${card.price} ETH</h5>
                    <a href="#" class="btn btn-primary">Mua</a>
                </div>
            </div>
        </div>`)
    }
    $('#dShop').show();
    openShop = true;
}

async function openCollection(){
    if (isOpen) return;
    const resJSON =await fetch('/api/v1/cards',{
        method: 'get',
        headers: {
            "Content-Type": "application/json",
        }
    });
    const cards = await resJSON.json();
    $('#rCollection').empty();
    var i = 0;
    while (cards[i]) {
        card = cards[i];
        i++;
        $('#rCollection').append(`
        <div class="col">
            <div class="card" style="width: 250px; margin-top: 10px">
                <img class="card-img-top" src="${card.image}" alt="${card.name}">
                <div class="card-body">
                    <h5 class="card-title">${card.price} ETH</h5>
                    <a href="#" class="btn btn-primary">Mua</a>
                </div>
            </div>
        </div>`)
    }
    $('#dCollection').show();
    isOpen = true;
}

const buildCards = [];
const botCards = [];
const state = [0,0,0,0,0];
var isCal =  false;
const result = [0,0,0,0,0];
const stateBot = [0,0,0,0,0];

async function openPlay(){

    if (isOpen) return;
    const resJSON =await fetch('/api/v1/cards',{
        method: 'get',
        headers: {
            "Content-Type": "application/json",
        }
    });
    const cards = await resJSON.json();
    var check = [-1,-1,-1,-1,-1];
    var lv = 20;
    if (lv>19) lv = 19;
    const min = Math.floor(lv/10) * 1500;
    const max = (Math.floor(lv/10) + 1) * 1500;
    var n = 0;
    while (cards[n])
        n++;
    for (var i = 0; i<5;i++){
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
        buildCards.push(cards[u]);
    }
    check = [-1,-1,-1,-1,-1];
    const cards1 = [];
    for (var u=0; u<n;u++)
        if ((cards[u].attributes[0].value >= min && cards[u].attributes[0].value <= max)
            &&  (cards[u].attributes[1].value >= min && cards[u].attributes[1].value <= max))
                cards1.push(cards[u])
    console.log(cards1.length)
    for (var i = 0; i<5;i++){
        var v = true;
        var u;
        while (v) {
            v=false;
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
    for (var i=0; i<5;i++){
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
                <div class="card-title" style="text-align: center">K???t qu???</div>
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
                    <button type="button" id="bt${i}1" onclick = "toAtk(${i})" class="btn btn-primary active">C??ng</button>
                    <button type="button" id="bt${i}2" onclick = "toDef(${i})" class="btn btn-primary inactive">Th???</button>
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
function toAtk(i){
    $('#bt'+i.toString()+'1').addClass('active');
    $('#bt'+i.toString()+'2').removeClass('active').addClass('inactive');
    state[i] = 0;
}

function toDef(i){
    $('#bt'+i.toString()+'2').addClass('active');
    $('#bt'+i.toString()+'1').removeClass('active').addClass('inactive');
    state[i] = 1;
}

function toLeft(i){
    if (i==0) return
    var j = i - 1;
    var t = buildCards[i];
    buildCards[i] = buildCards[j];
    buildCards[j] = t;
    console.log(i);
    $("#img"+i.toString()).attr("src",buildCards[i].image);
    $("#img"+j.toString()).attr("src",buildCards[j].image);
    var k = state[j];
    if (state[i]==0)
        toAtk(j);
    else
        toDef(j);
    if (k == 0)
        toAtk(i);
    else
        toDef(i);
}

function toRight(i){
    if (i==4) return
    var j = i + 1;
    var t = buildCards[i];
    buildCards[i] = buildCards[j];
    buildCards[j] = t;
    console.log(i);
    $("#img"+i.toString()).attr("src",buildCards[i].image);
    $("#img"+j.toString()).attr("src",buildCards[j].image);
    var k = state[j];
    if (state[i]==0)
        toAtk(j);
    else
        toDef(j);
    if (k == 0)
        toAtk(i);
    else
        toDef(i);
}

function calculator(){
    if (isCal)
    {
        closeAll();
        return 
    }
    for (var i=0; i<5;i++){
        if (botCards[i].attributes[0].value >= botCards[i].attributes[1].value){
            if (state[i] == 0){
                if (botCards[i].attributes[0].value > buildCards[i].attributes[0].value)
                    result[i] = -1;
                if (botCards[i].attributes[0].value < buildCards[i].attributes[0].value)
                    result[i] = 1;  
                if (botCards[i].attributes[0].value == buildCards[i].attributes[0].value)
                    result[i] = 0;
            }
            else{
                if (botCards[i].attributes[0].value > buildCards[i].attributes[1].value)
                    result[i] = -1;
                if (botCards[i].attributes[0].value < buildCards[i].attributes[1].value)
                    result[i] = 1;  
                if (botCards[i].attributes[0].value == buildCards[i].attributes[1].value)
                    result[i] = 0;
            }
        }
        else{
            stateBot[i] = 1;
            if (state[i] == 0){
                if (botCards[i].attributes[1].value > buildCards[i].attributes[0].value)
                    result[i] = -1;
                if (botCards[i].attributes[1].value < buildCards[i].attributes[0].value)
                    result[i] = 1;  
                if (botCards[i].attributes[1].value == buildCards[i].attributes[0].value)
                    result[i] = 0;
            }
            else{
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
    for (var i = 0; i < 5; i++){
        t = t + result[i];
        var st1 = 'Th???';
        if (stateBot[i] == 0)
            var st1 = 'C??ng';
        var st2 = 'Th???ng';
        if (result[i] == 0)
            st2 = 'Ho??'
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
        alert("Ho??");
    if (t < 0)
        alert("Thua");
    if (t > 0)
        alert("Th???ng");
    isCal = true;
}

function closeAll(){
    window.location.href = '/game';
}