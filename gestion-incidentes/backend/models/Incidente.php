<?php
class Incidente {
    private $conn;
    private $table_name = "incidentes";

    public $id;
    public $titulo;
    public $descripcion;
    public $fecha_reporte;
    public $prioridad;
    public $estado;
    public $id_usuario;

    public function __construct($db) {
        $this->conn = $db;
    }

    function leer() {
        $query = "SELECT id, titulo, descripcion, fecha_reporte, prioridad, estado, id_usuario FROM " . $this->table_name . " ORDER BY fecha_reporte DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->get_result();
    }

    function crear() {
        $query = "INSERT INTO " . $this->table_name . " SET titulo=?, descripcion=?, prioridad=?, estado=?, id_usuario=?";

        $stmt = $this->conn->prepare($query);

        $this->titulo = htmlspecialchars(strip_tags($this->titulo));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->prioridad = htmlspecialchars(strip_tags($this->prioridad));
        $this->estado = htmlspecialchars(strip_tags($this->estado));
        $this->id_usuario = htmlspecialchars(strip_tags($this->id_usuario));

        $stmt->bind_param("ssssi", $this->titulo, $this->descripcion, $this->prioridad, $this->estado, $this->id_usuario);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }
}
?>
