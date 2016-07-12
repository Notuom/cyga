CREATE SCHEMA IF NOT EXISTS log515_cyga;

SET SCHEMA 'log515_cyga';

CREATE TYPE UserType AS ENUM ('admin', 'user');

CREATE TABLE Users
(
  userId SERIAL PRIMARY KEY,
  username VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(60) NOT NULL,
  userType UserType NOT NULL,
  dateAdded TIMESTAMP DEFAULT current_timestamp(2),
  dateModified TIMESTAMP DEFAULT current_timestamp(2)
);

CREATE TABLE Game
(
  gameId SERIAL PRIMARY KEY,
  gameDate TIMESTAMP DEFAULT current_timestamp(2)
);

CREATE TABLE Game_Users
(
  game_UserId SERIAL PRIMARY KEY,
  score INTEGER NOT NULL,
  gameId INTEGER NOT NULL REFERENCES Game(gameId),
  userId INTEGER NOT NULL REFERENCES Users(userId)
);

CREATE TABLE Acronym
(
  acronymId SERIAL PRIMARY KEY,
  acronym VARCHAR(10) NOT NULL,
  definition VARCHAR(100) NOT NULL,
  dateAdded TIMESTAMP DEFAULT current_timestamp(2),
  dateModified TIMESTAMP DEFAULT current_timestamp(2)
);

CREATE OR REPLACE FUNCTION update_dateModified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.dateModified = current_timestamp;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_timestamp_user
  BEFORE UPDATE ON Users
FOR EACH ROW
EXECUTE PROCEDURE update_dateModified_column();

CREATE TRIGGER tr_timestamp_acronym
  BEFORE UPDATE ON Acronym
FOR EACH ROW
EXECUTE PROCEDURE update_dateModified_column();

COMMIT;