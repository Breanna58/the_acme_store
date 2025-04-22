const express = require("express");
const morgan = require("morgan");

const {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  fetchFavorite, 
  destroyFavorites, 
} = require("./server/db");

const server = express();
client.connect();

server.use(express.json());
server.use(morgan("dev"));

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`server listening on port ${port}`)); 

// GET /api/users
server.get("/api/users", async (req, res, next) => {
  try {
    const users = await fetchUsers();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

// GET /api/products
server.get("/api/products", async (req, res, next) => {
  try {
    const products = await fetchProducts();
    res.send(products);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/favorites
server.get("/api/users/:id/favorites", async (req, res, next) => { 
  try {
    const favorites = await fetchFavorite({ users_id: req.params.id }); 
    res.send(favorites);
  } catch (error) {
    next(error);
  }
});

// POST /api/users/:id/favorites
server.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    const favorite = await createFavorite({
      users_id: req.params.id,
      products_id: req.body.product_id,
    });
    res.status(201).send(favorite);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:user_id/favorites/:id
server.delete("/api/users/:user_id/favorites/:id", async (req, res, next) => { // Fixed route and params
  try {
    await destroyFavorites({
      id: req.params.id,
      users_id: req.params.user_id,
    });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});
