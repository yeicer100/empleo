DROP DATABASE IF EXISTS quibdo_empleo;
CREATE DATABASE quibdo_empleo;
USE quibdo_empleo;

-- =========================================
-- TABLA USUARIO (login: candidatos, empresas y admins)
-- =========================================

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('candidato', 'empresa', 'admin') NOT NULL,
    estado ENUM('activo', 'inactivo', 'bloqueado') NOT NULL DEFAULT 'activo',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- TABLA CATEGORIA
-- =========================================

CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    icono VARCHAR(30)
);

-- =========================================
-- TABLA CANDIDATO
-- =========================================

CREATE TABLE candidato (
    id_candidato INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    documento VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(60) NOT NULL,
    apellidos VARCHAR(60) NOT NULL,
    telefono VARCHAR(15),
    ciudad VARCHAR(60),
    perfil_profesional VARCHAR(255),
    hoja_vida_url VARCHAR(255),
    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
);

-- =========================================
-- TABLA EMPRESA
-- =========================================

CREATE TABLE empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    id_categoria INT NOT NULL,
    nit VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    ciudad VARCHAR(60) NOT NULL,
    telefono VARCHAR(15),
    logo_url VARCHAR(255),
    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
);

-- =========================================
-- TABLA OFERTA
-- =========================================

CREATE TABLE oferta (
    id_oferta INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    id_categoria INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    ciudad VARCHAR(60) NOT NULL,
    modalidad ENUM('presencial', 'remoto', 'hibrido') NOT NULL DEFAULT 'presencial',
    tipo_contrato ENUM('indefinido', 'termino_fijo', 'temporal', 'prestacion_servicios') NOT NULL,
    salario_min DECIMAL(12,2),
    salario_max DECIMAL(12,2),
    destacada BOOLEAN NOT NULL DEFAULT FALSE,
    vistas INT NOT NULL DEFAULT 0,
    estado ENUM('borrador', 'activa', 'pausada', 'cerrada') NOT NULL DEFAULT 'activa',
    fecha_publicacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATE,
    FOREIGN KEY (id_empresa)
        REFERENCES empresa(id_empresa),
    FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
);

-- =========================================
-- TABLA REQUISITO_OFERTA
-- =========================================

CREATE TABLE requisito_oferta (
    id_requisito INT AUTO_INCREMENT PRIMARY KEY,
    id_oferta INT NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    FOREIGN KEY (id_oferta)
        REFERENCES oferta(id_oferta)
);

-- =========================================
-- TABLA BENEFICIO_OFERTA
-- =========================================

CREATE TABLE beneficio_oferta (
    id_beneficio INT AUTO_INCREMENT PRIMARY KEY,
    id_oferta INT NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    FOREIGN KEY (id_oferta)
        REFERENCES oferta(id_oferta)
);

-- =========================================
-- TABLA POSTULACION
-- =========================================

CREATE TABLE postulacion (
    id_postulacion INT AUTO_INCREMENT PRIMARY KEY,
    id_oferta INT NOT NULL,
    id_candidato INT NOT NULL,
    fecha_postulacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('enviada', 'en_revision', 'preseleccionado', 'rechazado', 'contratado') NOT NULL DEFAULT 'enviada',
    FOREIGN KEY (id_oferta)
        REFERENCES oferta(id_oferta),
    FOREIGN KEY (id_candidato)
        REFERENCES candidato(id_candidato),
    UNIQUE (id_oferta, id_candidato)
);

-- =========================================
-- TABLA OFERTA_GUARDADA
-- =========================================

CREATE TABLE oferta_guardada (
    id_guardada INT AUTO_INCREMENT PRIMARY KEY,
    id_candidato INT NOT NULL,
    id_oferta INT NOT NULL,
    fecha_guardada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_candidato)
        REFERENCES candidato(id_candidato),
    FOREIGN KEY (id_oferta)
        REFERENCES oferta(id_oferta),
    UNIQUE (id_candidato, id_oferta)
);

-- =========================================
-- CATEGORIAS
-- =========================================

INSERT INTO categoria (id_categoria, nombre, icono) VALUES
(1, 'Salud', 'stethoscope'),
(2, 'Educacion', 'book'),
(3, 'Tecnologia', 'laptop'),
(4, 'Ingenieria', 'gear'),
(5, 'Administracion', 'briefcase'),
(6, 'Legal', 'scale'),
(7, 'Construccion', 'hammer'),
(8, 'Comercio', 'store'),
(9, 'Medio Ambiente', 'leaf');

-- (Sin datos de ejemplo: las empresas, ofertas y candidatos se crean desde la pagina)

-- =========================================
-- CONSULTAR DATOS
-- =========================================

SELECT * FROM usuario;
SELECT * FROM categoria;
SELECT * FROM empresa;
SELECT * FROM candidato;
SELECT * FROM oferta;
SELECT * FROM requisito_oferta;
SELECT * FROM beneficio_oferta;
SELECT * FROM postulacion;
SELECT * FROM oferta_guardada;
