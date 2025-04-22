const pg = require("pg");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt"); // Fixed typo

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme__store"
);

// Create table that drops and creates tables
const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS users_favorite;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;

    CREATE TABLE products (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );

    CREATE TABLE users (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE users_favorite (
      id UUID PRIMARY KEY,
      products_id UUID REFERENCES products(id) NOT NULL,
      users_id UUID REFERENCES users(id) NOT NULL,
      CONSTRAINT unique_users_favorite UNIQUE (products_id, users_id)
    );
  `;

  await client.query(SQL);
};

// Create product
const createProduct = async (name) => {
  const SQL = `
    INSERT INTO products(id, name)
    VALUES($1, $2)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuidv4(), name]);
  return response.rows[0];
};

// Create a user
const createUser = async ({ name, password }) => {
  const hashedPassword = await bcrypt.hash(password, 5);
  const SQL = `
    INSERT INTO users(id, name, password)
    VALUES($1, $2, $3)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuidv4(), name, hashedPassword]);
  return response.rows[0];
};

// Fetch users
const fetchUsers = async () => {
  const SQL = `SELECT id, name FROM users;`;
  const response = await client.query(SQL);
  return response.rows;
};

// Fetch products
const fetchProducts = async () => {
  const SQL = `SELECT * FROM products;`;
  const response = await client.query(SQL);
  return response.rows;
};

// Fetch favorites
const fetchFavorite = async ({ users_id, products_id }) => {
  const SQL = `
    INSERT INTO users_favorite(id, users_id, products_id)
