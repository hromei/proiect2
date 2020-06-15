'use strict'

var cookieParser = require('cookie-parser');

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')

const app = express();

const port = 6789;

var lista;
const fs = require('fs');

// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('views', './views');
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());


// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res

app.get('/', function (req, res, next) {
	//res.render('layout', {page:'Home', menuId:'home'});

	res.render('index', {logare : req.cookies})
});

//citesc fisierul in afara functiei fiindca am eroare la length 
fs.readFile('intrebari.json', (err, data) => {
	if (err) throw err;
	lista = JSON.parse(data).listaIntrebari;
	//console.log(lista[0].corect);
})

// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată
app.get('/chestionar', (req, res) => {
	
	// în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care conține vectorul de întrebări
	res.render('chestionar', { intrebari: lista });
});

app.post('/rezultat-chestionar', (req, res) => {
    var chestionar = JSON.parse(JSON.stringify(req.body));
    var corecte = 0;

    for(var i=0; i<lista.length; i++){
        if(chestionar['raspuns'+i] == lista[i].corect){
            corecte++;
        }
    }

	res.render('rezultat-chestionar', {intrebari: lista, RaspCorecte: corecte});
});

app.get('/autentificare', (req, res) => {
	res.render('autentificare', { mesajErr: req.cookies });
})

app.post('/verificare-autentificare', (req, res) => {
	var nume="alexandra"
	var parola="alexandra"
	console.log(req.body);
	if(req.body.username == nume && req.body.pass == parola){
		res.cookie("username", req.body.username);
		res.clearCookie("utilizator");
		res.redirect("/");
	}
	else {
		res.cookie("mesajEroare", "Utilizator sau parola gresite");
		res.redirect("/autentificare");
		res.clearCookie("mesajEroare");
	}
});

app.get('/logout', async (req,res)=> {
	await req.logout();
	res.clearCookie("user");
	return res.redirect('/');
});
/*
app.get('/', function (req, res) {
   
	var mysql = require('mysql');

	var con = mysql.createConnection({
	  host: "localhost",
	  user: "alexandra",
	  password: "alexandra",
	  database: 'cumparaturi'
	});
	
	con.connect(function(err) {
	  if (err) throw err;
	  console.log("Connected!");
	})
});

app.post('/creare-db', async (req,res) => {
	await user.connect();

	try{
		await user.querry('CREATE DATABASE cumparaturi');
	} catch (err){

	}

	try {
		await user.querry('CREATE TABLE produce (id SERIAL PRIMARY KEY)');
	}catch{
		console.log(err);
	}

	res.redirect('/');

});
*/
app.listen(port, () => console.log(`Some Magic is happening at http://localhost:`));