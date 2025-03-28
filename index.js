const express = require('express');  
const app = express();
const cors = require('cors');  
const db = require('./connection'); 
app.use(express.json());
app.use(cors());  

app.get("/api/registros", async (req, res) => {
    try {
        const actores_productores = await db.query("SELECT * FROM actores_productores_rey_leon");
        const personajes = await db.query("SELECT * FROM personajes_rey_leon");
        res.status(200).json({
            actores_productores: actores_productores.rows,
            personajes: personajes.rows
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener los registros", error: error.message });
    }
});

app.get("/api/registros/:tabla/:id", async (req, res) => {
    const { tabla, id } = req.params;
    const tablasValidas = ["actores_productores_rey_leon", "personajes_rey_leon"];
    if (!tablasValidas.includes(tabla)) {
        return res.status(400).json({ mensaje: "Tabla no válida" });
    }
    try {
        const resultado = await db.query(`SELECT * FROM ${tabla} WHERE id = $1`, [id]);
        if (resultado.rows.length > 0) {
            res.status(200).json(resultado.rows[0]);
        } else {
            res.status(404).json({ mensaje: "Registro no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener el registro", error: error.message });
    }
});

app.post("/api/registros/:tabla", async (req, res) => {
    const { tabla } = req.params;
    let { nombre, rol, personaje_asociado, pelicula, especie, descripcion } = req.body;
    const tablasValidas = ["actores_productores_rey_leon", "personajes_rey_leon"];
    if (!tablasValidas.includes(tabla)) {
        return res.status(400).json({ mensaje: "Tabla no válida" });
    }
    try {
        let query, values;

        if (tabla === "actores_productores_rey_leon") {
            nombre = nombre || "Desconocido";
            rol = rol || "Desconocido";
            personaje_asociado = personaje_asociado || "No especificado";
            pelicula = pelicula || "No especificado";
            query = `INSERT INTO ${tabla} (nombre, rol, personaje_asociado, pelicula) VALUES ($1, $2, $3, $4) RETURNING *`;
            values = [nombre, rol, personaje_asociado, pelicula];
        } else {
            nombre = nombre || "Desconocido";
            especie = especie || "Desconocida";
            rol = rol || "No especificado";
            descripcion = descripcion || "Sin descripción";
            query = `INSERT INTO ${tabla} (nombre, especie, rol, descripcion) VALUES ($1, $2, $3, $4) RETURNING *`;
            values = [nombre, especie, rol, descripcion];
        }
        const resultado = await db.query(query, values);
        res.status(201).json({ mensaje: "Registro creado con éxito", registro: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al insertar el registro", error: error.message });
    }
});

app.put("/api/registros/:tabla/:id", async (req, res) => {
    const { tabla, id } = req.params;
    const { nombre, rol, personaje_asociado, pelicula, especie, descripcion } = req.body;
    const tablasValidas = ["actores_productores_rey_leon", "personajes_rey_leon"];

    if (!tablasValidas.includes(tabla)) {
        return res.status(400).json({ mensaje: "Tabla no válida" });
    }

    console.log("Datos recibidos:", req.body); 
    try {
        let query, values;
        if (tabla === "actores_productores_rey_leon") {
            query = `UPDATE ${tabla} SET 
                        nombre = COALESCE($1, nombre), 
                        rol = COALESCE(NULLIF($2, ''), rol), 
                        personaje_asociado = COALESCE($3, personaje_asociado), 
                        pelicula = COALESCE($4, pelicula) 
                     WHERE id = $5 RETURNING *`;
            values = [nombre || null, rol || null, personaje_asociado || null, pelicula || null, id];
        } else {
            query = `UPDATE ${tabla} SET 
                        nombre = COALESCE($1, nombre), 
                        especie = COALESCE($2, especie), 
                        rol = COALESCE(NULLIF($3, ''), rol), 
                        descripcion = COALESCE($4, descripcion) 
                     WHERE id = $5 RETURNING *`;
            values = [nombre || null, especie || null, rol || null, descripcion || null, id];
        }
        const resultado = await db.query(query, values);
        if (resultado.rows.length > 0) {
            res.status(200).json({ mensaje: "Registro actualizado", registro: resultado.rows[0] });
        } else {
            res.status(404).json({ mensaje: "Registro no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar el registro", error: error.message });
    }
});

app.delete("/api/registros/:tabla/:id", async (req, res) => {
    const { tabla, id } = req.params;
    const tablasValidas = ["actores_productores_rey_leon", "personajes_rey_leon"];
    if (!tablasValidas.includes(tabla)) {
        return res.status(400).json({ mensaje: "Tabla no válida" });
    }
    try {
        const resultado = await db.query(`DELETE FROM ${tabla} WHERE id = $1 RETURNING *`, [id]);
        if (resultado.rows.length > 0) {
            res.status(200).json({ mensaje: "Registro eliminado", registro: resultado.rows[0] });
        } else {
            res.status(404).json({ mensaje: "Registro no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar el registro", error: error.message });
    }
});

app.listen(5000, () => {
    console.log("Servidor escuchando en el puerto 5000");
});
