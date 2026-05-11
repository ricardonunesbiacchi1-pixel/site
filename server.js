const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ================= UTIL ================= */

function read(file) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function write(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ================= FRETE (SIMULADO) ================= */

app.post("/calcular-frete", (req,res)=>{

    const { cep } = req.body;

    if(!cep){
        return res.status(400).json({erro:"CEP obrigatório"});
    }

    const primeiroNumero = Number(cep[0]);

    let base = 10;

    if(primeiroNumero >= 7) base = 25;
    else if(primeiroNumero >= 4) base = 18;
    else base = 12;

    const fretes = [
        {
            name:"PAC",
            price:(base).toFixed(2),
            delivery_time:7
        },
        {
            name:"SEDEX",
            price:(base + 12).toFixed(2),
            delivery_time:2
        },
        {
            name:"Entrega Expressa",
            price:(base + 20).toFixed(2),
            delivery_time:1
        }
    ];

    res.json(fretes);
});

/* ================= USERS ================= */

app.get("/users", (req, res) => {
    res.json(read("usuarios.json"));
});

app.post("/users", (req, res) => {

    const users = read("usuarios.json");

    const user = {
        id: Date.now(),
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };

    users.push(user);
    write("usuarios.json", users);

    res.json(user);
});

/* ================= LOGIN ================= */

app.post("/login", (req, res) => {

    const users = read("usuarios.json");

    const user = users.find(
        u => u.email === req.body.email &&
             u.password === req.body.password
    );

    if (!user) {
        return res.status(401).json({ error: "Login inválido" });
    }

    res.json({ user });
});

/* ================= PRODUCTS ================= */

app.get("/products", (req, res) => {
    res.json(read("produtos.json"));
});

app.post("/products", (req, res) => {

    const products = read("produtos.json");

    const product = {
        id: Date.now(),
        name: req.body.name,
        price: Number(req.body.price),
        cost: Number(req.body.cost || 0),
        image: req.body.image || "",
        description: req.body.description || ""
    };

    products.push(product);
    write("produtos.json", products);

    res.json(product);
});

app.delete("/products/:id", (req, res) => {

    let products = read("produtos.json");

    products = products.filter(
        p => p.id !== Number(req.params.id)
    );

    write("produtos.json", products);

    res.json({ ok: true });
});

/* ================= ORDERS ================= */

app.get("/orders", (req, res) => {
    res.json(read("orders.json"));
});

app.post("/orders", (req, res) => {

    const orders = read("orders.json");

    const order = {
        id: Date.now(),
        cliente: req.body.cliente || "Cliente",
        endereco: req.body.endereco || "Não informado",
        items: req.body.items || [],
        total: Number(req.body.total || 0),
        status: "pendente",
        pagamento: req.body.pagamento || "",
        date: new Date().toISOString()
    };

    orders.push(order);
    write("orders.json", orders);

    console.log("📦 Pedido:", order.id);

    res.json(order);
});

app.put("/orders/:id", (req, res) => {

    const orders = read("orders.json");

    const i = orders.findIndex(
        o => o.id === Number(req.params.id)
    );

    if (i === -1) {
        return res.status(404).json({ error: "Pedido não encontrado" });
    }

    orders[i].status = req.body.status;

    write("orders.json", orders);

    res.json(orders[i]);
});

app.delete("/orders/:id", (req, res) => {

    let orders = read("orders.json");

    orders = orders.filter(
        o => o.id !== Number(req.params.id)
    );

    write("orders.json", orders);

    res.json({ ok: true });
});

/* ================= REVIEWS ================= */

app.get("/reviews/:productId", (req, res) => {

    const reviews = read("reviews.json");

    const filtered = reviews.filter(
        r => r.productId == req.params.productId
    );

    res.json(filtered);
});

app.post("/reviews", (req, res) => {

    const reviews = read("reviews.json");

    const review = {
        id: Date.now(),
        productId: req.body.productId,
        nome: req.body.nome,
        comentario: req.body.comentario,
        nota: Number(req.body.nota),
        likes: 0,
        date: new Date().toISOString()
    };

    reviews.unshift(review);
    write("reviews.json", reviews);

    res.json(review);
});

app.post("/reviews/like/:id", (req,res)=>{

    let reviews = read("reviews.json");

    const review = reviews.find(r => r.id == req.params.id);

    if(!review){
        return res.status(404).json({
            error:"Avaliação não encontrada"
        });
    }

    review.likes = (review.likes || 0) + 1;

    write("reviews.json", reviews);

    res.json({
        success:true,
        likes:review.likes
    });
});

/* ================= START ================= */

app.listen(3000, "0.0.0.0", () => {
    console.log("🚀 servidor rodando na porta 3000");
});