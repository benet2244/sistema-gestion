<?php
// gestion-incidentes/backend/models/Usuario.php

class Usuario {
    // Conexión a la base de datos y nombre de la tabla
    private $conn;
    private $table_name = "usuarios";

    // Propiedades del objeto
    public $id;
    public $nombre_usuario;
    public $contrasena;
    public $rol;

    // Constructor con la conexión a la base de datos
    public function __construct($db) {
        $this->conn = $db;
    }

    // Método para buscar un usuario por nombre_usuario
    // Esto será la base para nuestro login
    function buscarPorNombreUsuario() {
        // Consulta para seleccionar un solo registro
        $query = "SELECT
                    id, nombre_usuario, contrasena, rol
                FROM
                    " . $this->table_name . "
                WHERE
                    nombre_usuario = ?
                LIMIT
                    0,1";

        // Preparar la declaración de la consulta
        $stmt = $this->conn->prepare($query);

        // Vincular el nombre de usuario
        $stmt->bind_param("s", $this->nombre_usuario);

        // Ejecutar la consulta
        $stmt->execute();

        // Obtener el resultado
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            // Obtener la fila encontrada
            $row = $result->fetch_assoc();

            // Establecer los valores a las propiedades del objeto
            $this->id = $row['id'];
            $this->nombre_usuario = $row['nombre_usuario'];
            $this->contrasena = $row['contrasena']; // Esta es la contraseña hasheada de la BD
            $this->rol = $row['rol'];

            return true;
        }

        return false;
    }
}
?>