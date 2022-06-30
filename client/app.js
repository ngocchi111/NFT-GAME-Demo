const express = require('express')
const path = require('path');
const app = express()

const {engine} = require('express-handlebars');
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'))

const url = './assets/data.json'
const cards = loadData()

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/login.html'));
})

app.get('/', (req, res) => {
    res.render('home', cards)
})

app.get('/play', (req, res) =>{
    const buildCards = [];
    const botCards = [];
    var check = [-1,-1,-1,-1,-1];
    const lv = 1;
    const min = Math.round(lv/10);
    const max = (Math.round(lv/10) + 1) * 300;
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
    for (var i = 0; i<5;i++){
        var v = true;
        var u;
        while (v) {
            v = false;
            u = Math.floor(Math.random() * n);
            if ((cards[u].attributes[0].value >= min && cards[u].attributes[0].value <= max)
                ||  (cards[u].attributes[1].value >= min && cards[u].attributes[1].value <= max))
                    v = false;
            if (!v)
            for (var t of check)
                if (t === u)
                    v = true;
        }
        check[i] = u;
        botCards.push(cards[u]);
    }
    res.render('game', {buildCards: buildCards, botCards: botCards})
})

app.get('/api/v1/cards', (req, res) => {
    return res.send(cards);
});

app.get('/library', (req, res) => {
    return res.render('library', {cards: cards});
});

app.get('/api/v1/cards/:cardId', (req, res) => {
    console.log('/api/v1/cards/:cardId')

    var cardId = req.params.cardId;
    return res.send(cards[cardId]);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('listening at PORT ' + PORT)
    loadData()
})

function loadData() {
    const jsonData = require(url);
    var cards = {};
    for (var i in jsonData) {
        var card = JSON.parse(JSON.stringify(jsonData[i]));
        cards[i] = card;
    }

    return cards;
}

// function setPrice() {

//     const jsonData = require(url);
//     for (var i in jsonData) {
//         const atk = jsonData[i]['attributes'][0]['value'];
//         const def = jsonData[i]['attributes'][1]['value'];

//         var price = (atk / 10000) + (def / 10000);

//         if (price <= 0.0) {
//             price = 0.01;
//         }

//         price = price.toFixed(3);

//         console.log(price)

//         jsonData[i]['price'] = price;
//         jsonData[i]['attributes'] = jsonData[i]['attributes'];
//     }
//     var json = JSON.stringify(jsonData)
//     var fs = require('fs');
//     fs.writeFile('myjsonfile.json', json, 'utf8', function readFileCallback(err, data) {
//         if (err) {
//             console.log(err);
//         }
//         // else {
//         //     obj = JSON.parse(data); //now it an object
//         //     obj.table.push({ id: 2, square: 3 }); //add some data
//         //     json = JSON.stringify(obj); //convert it back to json
//         //     fs.writeFile('myjsonfile.json', json, 'utf8', callback); // write it back 
//         // }
//     });
// }