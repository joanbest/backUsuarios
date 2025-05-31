require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require('multer');
const mysql = require("mysql2");
const cloudinary = require('cloudinary').v2;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const app = express();

app.use(cors({
  origin: 'https://final-web-opal.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());

app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin);
  next();
});



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const pool = mysql.createPool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get("/", (req, res) => {
  res.send("Hola desde tu primera ruta de la API");
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Faltan datos");
  }

  pool.query(
    "SELECT nombre_usuario, contrasena_usuario, rol FROM usuarios WHERE nombre_usuario = ?",
    [username],
    async (err, result) => {
      if (err) {
        console.error("Error en consulta MySQL:", err);
        return res.status(500).send("Error en base de datos");
      }
      if (result.length > 0) {
        const match = await bcrypt.compare(password, result[0].contrasena_usuario);
        if (match) {
          res.status(200).send({
            nombre_usuario: result[0].nombre_usuario,
            rol: result[0].rol,
          });
        } else {
          res.status(400).send("Contraseña incorrecta");
        }
      } else {
        res.status(400).send("Usuario no existe");
      }
    }
  );
});

// Obtener todos los usuarios
app.get("/api/usuarios", (req, res) => {
  pool.query("SELECT * FROM usuarios", (err, result) => {
    if (err) return res.status(500).send("Error al obtener usuarios");
    res.send(result);
  });
});

// Crear nuevo usuario
app.post("/api/usuarios", async (req, res) => {
  const { nombre_usuario, contrasena_usuario, rol } = req.body;
  if (!nombre_usuario || !contrasena_usuario || !rol) {
    return res.status(400).send("Faltan datos del usuario");
  }

  try {
    const hash = await bcrypt.hash(contrasena_usuario, 10);
    pool.query(
      "INSERT INTO usuarios (nombre_usuario, contrasena_usuario, rol) VALUES (?, ?, ?)",
      [nombre_usuario, hash, rol],
      (err) => {
        if (err) return res.status(500).send("Error al crear usuario");
        res.sendStatus(200);
      }
    );
  } catch (err) {
    res.status(500).send("Error al encriptar la contraseña");
  }
});

// Actualizar usuario
app.put("/api/usuarios/:id", async (req, res) => {
  const { nombre_usuario, contrasena_usuario, rol } = req.body;
  const { id } = req.params;

  if (!nombre_usuario || !contrasena_usuario || !rol) {
    return res.status(400).send("Faltan datos para actualizar");
  }
try {
    const hash = await bcrypt.hash(contrasena_usuario, 10);
  pool.query(
    "UPDATE usuarios SET nombre_usuario = ?, contrasena_usuario = ?, rol = ? WHERE id = ?",
    [nombre_usuario, hash, rol, id],
    (err) => {
      if (err) return res.status(500).send("Error al actualizar usuario");
      res.sendStatus(200);
    }
  );
} catch (err) {
    res.status(500).send("Error al encriptar la contraseña");
  }
});

// Eliminar usuario
app.delete("/api/usuarios/:id", (req, res) => {
  const { id } = req.params;

  pool.query(
    "DELETE FROM usuarios WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).send("Error al eliminar usuario");
      res.sendStatus(200);
    }
  );
});

// Subida de archivos a Cloudinary
app.post('/upload/:projectId', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió archivo' });
  }

  const { buffer, originalname } = req.file;

  const stream = cloudinary.uploader.upload_stream(
    {
      resource_type: 'auto',
      folder: `proyectos/${req.params.projectId}`,
      public_id: originalname.split('.')[0],
    },
    (error, result) => {
      if (error) {
        console.error("Error al subir a Cloudinary:", error);
        return res.status(500).json({ error: 'Error al subir a Cloudinary' });
      }
      res.json({
        url: result.secure_url,
        tipo: req.query.tipo || 'desconocido',
        nombre: originalname,
      });
    }
  );

  require('stream').Readable.from(buffer).pipe(stream);
});

const PORT = process.env.PORT ;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
