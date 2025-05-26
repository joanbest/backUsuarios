require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require('multer');
const mysql = require("mysql");
const cloudinary = require('cloudinary').v2;
const bodyParser = require("body-parser");
const app = express();
app.use(cors({
  origin: ['https://final-web-opal.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload/:projectId', upload.single('file'), (req, res) => {
  const { buffer, originalname } = req.file;
  const tipo = req.query.tipo === 'imagen' ? 'image' : 'document';
  console.log('Archivo recibido:', req.file);

  const stream = cloudinary.uploader.upload_stream(
    {
      resource_type: 'auto',
      folder: `proyectos/${req.params.projectId}`,
      public_id: originalname.split('.')[0],
    },
    (error, result) => {
      if (error) return res.status(500).json({ error });
      return res.json({
        url: result.secure_url,
        tipo: req.query.tipo,
        nombre: req.file.originalname,
      });
    }
  );

  require('stream').Readable.from(buffer).pipe(stream);
});

const credentials = {
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true },
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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log("hola soy el servidor"));
