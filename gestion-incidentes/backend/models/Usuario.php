<?php
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

    function crear() {
        $query = "INSERT INTO " . $this->table_name . " SET nombre_usuario=?, contrasena=?, rol=?";
        
        $stmt = $this->conn->prepare($query);

        $this->nombre_usuario = htmlspecialchars(strip_tags($this->nombre_usuario));
        $this->rol = htmlspecialchars(strip_tags($this->rol));
        $this->contrasena = password_hash($this->contrasena, PASSWORD_BCRYPT);

        $stmt->bind_param("sss", $this->nombre_usuario, $this->contrasena, $this->rol);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    function leerPorNombre() {
        $query = "SELECT id, nombre_usuario, contrasena, rol FROM " . $this->table_name . " WHERE nombre_usuario = ? LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $this->nombre_usuario);
        $stmt->execute();
        
        return $stmt->get_result();
    }
}
?>
