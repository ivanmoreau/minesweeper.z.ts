-- migrate:up

CREATE TABLE game_users (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE game_scores (
  user_id INT NOT NULL PRIMARY KEY,
  difficulty INT NOT NULL,
  size INT NOT NULL,
  time_seconds INT NOT NULL,
  score INT GENERATED ALWAYS AS ((difficulty * size) / time_seconds) STORED,
  FOREIGN KEY (user_id) REFERENCES game_users(id)
);

-- migrate:down

DROP TABLE game_users;
DROP TABLE game_scores;
