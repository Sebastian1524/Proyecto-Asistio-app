<?php
// Configuración de la base de datos PostgreSQL
define('DB_HOST', 'localhost');
define('DB_PORT', '5432');
define('DB_NAME', 'Asistio');
define('DB_USER', 'postgres');
define('DB_PASS', 'tu_contraseña'); // Cambiar por tu contraseña

// Clase para manejar la conexión a la base de datos
class Database {
    private $conn = null;
    
    public function connect() {
        try {
            $connString = "host=" . DB_HOST . 
                         " port=" . DB_PORT . 
                         " dbname=" . DB_NAME . 
                         " user=" . DB_USER . 
                         " password=" . DB_PASS;
            
            $this->conn = pg_connect($connString);
            
            if (!$this->conn) {
                throw new Exception("Error al conectar con la base de datos");
            }
            
            return $this->conn;
        } catch (Exception $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }
    
    public function close() {
        if ($this->conn) {
            pg_close($this->conn);
        }
    }
}

// Función helper para ejecutar queries de forma segura
function ejecutarQuery($conn, $query, $params = []) {
    if (empty($params)) {
        $result = pg_query($conn, $query);
    } else {
        $result = pg_query_params($conn, $query, $params);
    }
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . pg_last_error($conn));
    }
    
    return $result;
}

// Función para validar y sanitizar datos
function limpiarDato($dato) {
    return htmlspecialchars(strip_tags(trim($dato)));
}
?>