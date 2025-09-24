<?php
// gestion-incidentes/backend/models/Usuario.php

class Usuario {
    private $conn;
    private $table_name = "usuarios";

    public $id;
    public $nombre_usuario;
    public $contrasena;
    public $rol;

    public function __construct($db) {
        $this->conn = $db;
    }

    function buscarPorNombreUsuario() {
        $query = "SELECT
                      id, nombre_usuario, contrasena, rol
                  FROM
                      " . $this->table_name . "
                  WHERE
                      nombre_usuario = ?
                  LIMIT
                      0,1";

        $stmt = $this->conn->prepare($query);
        
        if ($stmt === false) {
            error_log("Error de preparación de consulta: " . $this->conn->error);
            return false;
        }
        
        $stmt->bind_param("s", $this->nombre_usuario);

        if (!$stmt->execute()) {
             error_log("Error de ejecución de consulta: " . $stmt->error);
             return false;
        }

        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $this->id = $row['id'];
            $this->nombre_usuario = $row['nombre_usuario'];
            $this->contrasena = $row['contrasena'];
            $this->rol = $row['rol'];
            $stmt->close();
            return true;
        }

        $stmt->close();
        return false;
    }

    function crear() {
        $query = "INSERT INTO " . $this->table_name . " (nombre_usuario, contrasena, rol) VALUES (?, ?, ?)";

        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            error_log("Error de preparación de consulta: " . $this->conn->error);
            return false;
        }

        $this->nombre_usuario = htmlspecialchars(strip_tags($this->nombre_usuario));
        $this->rol = htmlspecialchars(strip_tags($this->rol));

        $stmt->bind_param("sss", $this->nombre_usuario, $this->contrasena, $this->rol);

        if ($stmt->execute()) {
            $stmt->close();
            return true;
        }

        error_log("Error de ejecución de consulta: " . $stmt->error);
        $stmt->close();
        return false;
    }
}
?>