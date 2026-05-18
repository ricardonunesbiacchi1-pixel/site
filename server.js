const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ================= UTIL ================= */

function getFile(file){
    return path.join(__dirname, file);
}

function read(file){
    const filePath = getFile(file);

    if(!fs.existsSync(filePath)){
        fs.writeFileSync(filePath, "[]");
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch(e){
        return [];
    }
}

function write(file, data){
    const filePath = getFile(file);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/* ================= PRODUCTS ================= */

app.get("/products", (req,res)=>{
    try {
        res.json(read("produtos.json"));
    } catch(err){
        res.status(500).json([]);
    }
});

app.post("/products", (req,res)=>{

    const products = read("produtos.json");

    const product = {
        id: Date.now(),
        name: req.body.name,
        price: Number(req.body.price),
        image: req.body.image || "",
        description: req.body.description || ""
    };

    products.push(product);
    write("produtos.json", products);

    res.json(product);
});

/* ================= FRETE ================= */

app.post("/calcular-frete",(req,res)=>{

    const { cep } = req.body;

    if(!cep){
        return res.status(400).json({erro:"CEP obrigatório"});
    }

    const n = Number(cep[0]) || 1;

    let base = n >= 7 ? 25 : n >= 4 ? 18 : 12;

    res.json([
        {name:"PAC", price:base.toFixed(2), delivery_time:7},
        {name:"SEDEX", price:(base+12).toFixed(2), delivery_time:2},
        {name:"Express", price:(base+20).toFixed(2), delivery_time:1}
    ]);
});

app.listen(PORT,"0.0.0.0",()=>{
    console.log("Servidor rodando na porta "+PORT);
});