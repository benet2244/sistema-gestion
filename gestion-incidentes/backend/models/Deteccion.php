<?php
class Deteccion {
    private $conn;
    private $table_name = "detecciones";

    public $id_deteccion;
    public $source_ip;
    public $target_ip;
    public $hostname;
    public $detection_description;
    public $severity;
    public $fecha_registro;

    public function __construct($db) {
        $this->conn = $db;
    }

    function leer() {
        $query = "SELECT
                    id_deteccion, source_ip, target_ip, hostname, detection_description, severity, fecha_registro
                FROM
                    " . $this->table_name;

        $stmt = $this->conn->query($query);

        return $stmt;
    }
}
?>
