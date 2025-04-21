CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    login VARCHAR(127) UNIQUE ,
    password VARCHAR(127)
);

CREATE TABLE category (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(127) UNIQUE
);

CREATE TABLE post (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(127),
    content TEXT,
    user_id INT,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

CREATE TABLE comment (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT,
    post_id INT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES post(post_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);