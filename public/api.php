<?php

class User {
    public $id;
    public $name;

    public function __construct($id, $name) {
        $this->id = $id;
        $this->name = $name;
    }
}

class Score {
    public $user_id;
    public $score;
    public $time;
    public $size;
    public $difficulty;

    public function __construct($user_id, $score, $time, $size, $difficulty) {
        $this->user_id = $user_id;
        $this->score = $score;
        $this->time = $time;
        $this->size = $size;
        $this->difficulty = $difficulty;
    }
}

interface UserDAO {
    public function getUser($id);
    public function getByName($name);
    public function createUser($name);
}

interface ScoreDAO {
    public function getScore($id);
    public function getBestScores();
    public function setScore($score);
}

interface GameService {
    public function getBestScores();
    public function createUser($name);
    public function updateScore($name, $time, $size, $difficulty);
    public function getUserName($id);
}

class UserDAOImpl {
    private $dbConnection;

    public function __construct($dbConnection) {
        $this->dbConnection = $dbConnection;
    }

    public function getUser($id) {
        $sql = "SELECT * FROM game_users WHERE id = $id";
        $result = $this->dbConnection->query($sql);

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return new User($row['id'], $row['name']);
        } else {
            return null;
        }
    }

    public function getByName($name) {
        $sql = "SELECT * FROM game_users WHERE name = '$name'";
        $result = $this->dbConnection->query($sql);

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return new User($row['id'], $row['name']);
        } else {
            return null;
        }
    }

    public function createUser($name) {
        $sql = "INSERT INTO game_users (name) VALUES ('$name')";
        $this->dbConnection->query($sql);
    }
}

class ScoreDAOImpl implements ScoreDAO {
    private $dbConnection;

    public function __construct($dbConnection) {
        $this->dbConnection = $dbConnection;
    }

    public function getScore($id) {
        $sql = "SELECT * FROM game_scores WHERE user_id = $id";
        $result = $this->dbConnection->query($sql);

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return new Score(
                $row['user_id'],
                $row['score'],
                $row['time_seconds'],
                $row['size'],
                $row['difficulty']
            );
        } else {
            return null;
        }
    }

    public function getBestScores() {
        $sql = "SELECT * FROM game_scores ORDER BY score DESC LIMIT 5";
        $result = $this->dbConnection->query($sql);
        $scores = [];

        while ($row = $result->fetch_assoc()) {
            $scores[] = new Score(
                $row['user_id'],
                $row['score'],
                $row['time_seconds'],
                $row['size'],
                $row['difficulty']
            );
        }

        return $scores;
    }

    public function setScore($score) {
        $sql = "INSERT INTO game_scores (user_id, time_seconds, size, difficulty)
                VALUES ($score->user_id, $score->time, $score->size, $score->difficulty)
                ON DUPLICATE KEY UPDATE
                time_seconds = $score->time,
                size = $score->size,
                difficulty = $score->difficulty";
        $this->dbConnection->query($sql);
    }
}

class GameServiceImpl implements GameService {
    private $userDAO;
    private $scoreDAO;

    public function __construct($userDAO, $scoreDAO) {
        $this->userDAO = $userDAO;
        $this->scoreDAO = $scoreDAO;
    }

    public function getBestScores() {
        return $this->scoreDAO->getBestScores();
    }

    public function createUser($name) {
        $user = $this->userDAO->getByName($name);

        if ($user == null) {
            $this->userDAO->createUser($name);
            $user = $this->userDAO->getByName($name);
        }

        return $user;
    }

    public function updateScore($name, $time, $size, $difficulty) {
        $user = $this->userDAO->getByName($name);
        $score = $this->scoreDAO->getScore($user->id);

        if ($score == null) {
            $score = new Score($user->id, 0, 0, 0, 0);
        }

        $score->time = $time;
        $score->size = $size;
        $score->difficulty = $difficulty;

        $this->scoreDAO->setScore($score);
    }

    public function getUserName($id) {
        $user = $this->userDAO->getUser($id);
        return $user->name;
    }
}


class Environment {
    public $dbConnection;
    public $userDAO;
    public $scoreDAO;
    public $gameService;

    public function __construct($dbConnection) {
        $this->userDAO = new UserDAOImpl($dbConnection);
        $this->scoreDAO = new ScoreDAOImpl($dbConnection);
        $this->gameService = new GameServiceImpl($this->userDAO, $this->scoreDAO);
    }
}


// Back-end

// Load environment variables
$db_host = $_ENV['DB_HOST'];
$db_user = $_ENV['DB_USER'];
$db_pass = $_ENV['DB_PASS'];
$db_name = $_ENV['DB_NAME'];

// Create connection
$dbConnection = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($dbConnection->connect_error) {
    die("Connection failed: " . $dbConnection->connect_error);
}

// Create environment
$env = new Environment($dbConnection);

/****************** POST API ******************/
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['action'])) {
        switch ($data['action']) {
            case 'createUser':
                $user = $env->gameService->createUser($data['name']);
                echo json_encode($user);
                break;
            case 'updateScore':
                $env->gameService->updateScore($data['name'], $data['time'], $data['size'], $data['difficulty']);
                echo json_encode(true);
                break;
            case 'getBestScores':
                $scores = $env->gameService->getBestScores();
                echo json_encode($scores);
                break;
            case 'getUserName':
                $name = $env->gameService->getUserName($data['id']);
                echo json_encode($name);
                break;
        }
    }
}

/****************** GET API ******************/
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    header("HTTP/1.0 418 I'm A Teapot");
    echo '<h1>Unsupported request method</h1>';
    echo '<br />';
    echo '<img src="https://http.cat/images/418.jpg" alt="Unsupported request method" />';
    http_response_code(418);
    exit;
}


?>