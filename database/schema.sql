CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    category_id INT REFERENCES categories(id),
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    expense_date DATE NOT NULL
);