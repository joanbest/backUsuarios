const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "10mb" }));

const credentials = {
  host: "localhost",
  user: "root",
  password: "1",
  database: "usuarios",
};

app.get("/", (req, res) => {
  res.send("hola desde tu primera ruta de la Api");
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const values = [username, password];
  const connection = mysql.createConnection(credentials);

  connection.query(
    "SELECT nombre_usuario, rol FROM usuarios WHERE nombre_usuario = ? AND contrasena_usuario = ?",
    values,
    (err, result) => {
      if (err) {
        console.error("Error en consulta MySQL:", err);
        res.status(500).send(err);
      } else {
        if (result.length > 0) {
          res.status(200).send({
            nombre_usuario: result[0].nombre_usuario,
            rol: result[0].rol,
          });
        } else {
          res.status(400).send("Usuario no existe");
        }
      }
      connection.end();
    }
  );
});

// Obtener todos los usuarios
app.get("/api/usuarios", (req, res) => {
  const connection = mysql.createConnection(credentials);
  connection.query("SELECT * FROM usuarios", (err, result) => {
    if (err) res.status(500).send(err);
    else res.send(result);
    connection.end();
  });
});

// Crear nuevo usuario
app.post("/api/usuarios", (req, res) => {
  const { nombre_usuario, contrasena_usuario, rol } = req.body;
  const connection = mysql.createConnection(credentials);
  connection.query(
    "INSERT INTO usuarios (nombre_usuario, contrasena_usuario, rol) VALUES (?, ?, ?)",
    [nombre_usuario, contrasena_usuario, rol],
    (err) => {
      if (err) res.status(500).send(err);
      else res.sendStatus(200);
      connection.end();
    }
  );
});

// Actualizar usuario
app.put("/api/usuarios/:id", (req, res) => {
  const { nombre_usuario, contrasena_usuario, rol } = req.body;
  const connection = mysql.createConnection(credentials);
  connection.query(
    "UPDATE usuarios SET nombre_usuario = ?, contrasena_usuario = ?, rol = ? WHERE id = ?",
    [nombre_usuario, contrasena_usuario, rol, req.params.id],
    (err) => {
      if (err) res.status(500).send(err);
      else res.sendStatus(200);
      connection.end();
    }
  );
});

// Eliminar usuario
app.delete("/api/usuarios/:id", (req, res) => {
  const connection = mysql.createConnection(credentials);
  connection.query(
    "DELETE FROM usuarios WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) res.status(500).send(err);
      else res.sendStatus(200);
      connection.end();
    }
  );
});


app.listen(4000, () => console.log("hola soy el servidor"));
