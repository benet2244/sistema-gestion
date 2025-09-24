<?php
// gestion-incidentes/backend/database.php

class Database {
    // Credenciales de la base de datos
    // DEBES REEMPLAZAR ESTOS VALORES con tus propias credenciales
    private $host = "localhost"; // o la IP de tu servidor de base de datos
    private $db_name = "gestion_incidentes_db";
    private $username = "sistema";
    private $password = "35iph7UhhXlUjRmR";
    public $conn;

    // Método para obtener la conexión a la base de datos
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);
        } catch(mysqli_sql_exception $exception) {
            echo "Error de conexión: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>