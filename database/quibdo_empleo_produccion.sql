
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

-- =========================================
-- USUARIOS (empresas) + EMPRESAS
-- Nota: password_hash es un valor de ejemplo. En el backend real
-- nunca guardes la contraseña en texto plano, usa bcrypt u otra
-- libreria de hashing antes de insertar.
-- =========================================

INSERT INTO usuario (id_usuario, correo, password_hash, rol) VALUES
(1, 'contacto@hospitalsanfrancisco.org', 'hash_temporal_1', 'empresa'),
(2, 'info@constructorapacifico.com', 'hash_temporal_2', 'empresa'),
(3, 'contacto@chocodigital.com', 'hash_temporal_3', 'empresa'),
(4, 'contacto@ccquibdo.org', 'hash_temporal_4', 'empresa'),
(5, 'info@codechoco.gov.co', 'hash_temporal_5', 'empresa'),
(6, 'rectoria@iemanuelsaturio.edu.co', 'hash_temporal_6', 'empresa');

INSERT INTO empresa
(id_empresa, id_usuario, id_categoria, nit, nombre, descripcion, ciudad, telefono)
VALUES
(1, 1, 1, '900111222-1', 'Hospital Universitario San Francisco de Asis',
    'Principal centro hospitalario de referencia del Departamento del Choco, con mas de 60 anos de historia.',
    'Quibdo, Choco', '3201110000'),
(2, 2, 7, '900222333-2', 'Constructora Pacifico S.A.S',
    'Empresa lider en construccion de infraestructura vial, social y habitacional en el departamento del Choco.',
    'Quibdo, Choco', '3202220000'),
(3, 3, 3, '900333444-3', 'Choco Digital S.A.S',
    'Startup tecnologica chocoana dedicada al desarrollo de soluciones digitales para el sector publico y privado.',
    'Quibdo, Choco', '3203330000'),
(4, 4, 8, '900444555-4', 'Camara de Comercio de Quibdo',
    'Institucion que promueve el desarrollo empresarial y la formalizacion comercial en la region del Choco.',
    'Quibdo, Choco', '3204440000'),
(5, 5, 9, '900555666-5', 'Codechoco',
    'Corporacion Autonoma Regional del Choco, entidad encargada de la administracion y preservacion del medio ambiente.',
    'Quibdo, Choco', '3205550000'),
(6, 6, 2, '900666777-6', 'Institucion Educativa Manuel Saturio Valencia',
    'Una de las instituciones educativas mas importantes de Quibdo, con tradicion de mas de 50 anos.',
    'Quibdo, Choco', '3206660000');

-- =========================================
-- USUARIOS (candidatos) + CANDIDATOS
-- =========================================

INSERT INTO usuario (id_usuario, correo, password_hash, rol) VALUES
(7, 'valentina.mosquera@example.com', 'hash_temporal_7', 'candidato'),
(8, 'juan.palacios@example.com', 'hash_temporal_8', 'candidato'),
(9, 'laura.cordoba@example.com', 'hash_temporal_9', 'candidato'),
(10, 'andres.perea@example.com', 'hash_temporal_10', 'candidato'),
(11, 'camila.renteria@example.com', 'hash_temporal_11', 'candidato');

INSERT INTO candidato
(id_candidato, id_usuario, documento, nombres, apellidos, telefono, ciudad, perfil_profesional)
VALUES
(1, 7, '1077800001', 'Valentina', 'Mosquera', '3101110001', 'Quibdo, Choco', 'Enfermera profesional con experiencia hospitalaria'),
(2, 8, '1077800002', 'Juan', 'Palacios', '3101110002', 'Quibdo, Choco', 'Ingeniero civil recien egresado'),
(3, 9, '1077800003', 'Laura', 'Cordoba', '3101110003', 'Quibdo, Choco', 'Licenciada en Matematicas'),
(4, 10, '1077800004', 'Andres', 'Perea', '3101110004', 'Quibdo, Choco', 'Desarrollador web full stack'),
(5, 11, '1077800005', 'Camila', 'Renteria', '3101110005', 'Quibdo, Choco', 'Administradora de empresas');

-- =========================================
-- OFERTAS
-- =========================================

INSERT INTO oferta
(id_oferta, id_empresa, id_categoria, titulo, descripcion, ciudad, modalidad,
tipo_contrato, salario_min, salario_max, destacada, vistas, estado, fecha_cierre)
VALUES
(1, 1, 1, 'Enfermera Jefe',
    'Buscamos una Enfermera Jefe con experiencia en gestion de unidades de hospitalizacion para unirse a nuestro equipo medico. Responsable de coordinar el personal de enfermeria, garantizar la calidad en la atencion al paciente y supervisar protocolos clinicos en el area asignada.',
    'Quibdo, Choco', 'presencial', 'indefinido', 2500000, 3200000, TRUE, 312, 'activa', '2026-12-09'),

(2, 2, 4, 'Ingeniero Civil',
    'Se requiere Ingeniero Civil para supervision y ejecucion de proyectos de infraestructura vial en el departamento del Choco. Experiencia en interventoria y manejo de personal de obra.',
    'Quibdo, Choco', 'presencial', 'termino_fijo', 3000000, 5000000, TRUE, 198, 'activa', '2026-12-15'),

(3, 6, 2, 'Docente de Matematicas',
    'Institucion Educativa busca docente de Matematicas para basica secundaria y media. Se valora experiencia en metodologias activas de ensenanza.',
    'Quibdo, Choco', 'presencial', 'temporal', 2100000, 2700000, FALSE, 145, 'activa', '2026-12-20'),

(4, 3, 3, 'Desarrollador Web Full Stack',
    'Choco Digital S.A.S busca Desarrollador Full Stack para participar en el desarrollo de soluciones digitales para el sector publico y privado del Choco. Manejo de React, Node.js y bases de datos relacionales.',
    'Quibdo, Choco (Remoto parcial)', 'hibrido', 'indefinido', 4500000, 6000000, TRUE, 267, 'activa', '2027-01-01'),

(5, 4, 5, 'Administrador de Empresas',
    'Camara de Comercio de Quibdo busca Administrador de Empresas para apoyar procesos de formalizacion y acompanamiento empresarial en la region.',
    'Quibdo, Choco', 'presencial', 'indefinido', 2500000, 4000000, FALSE, 88, 'activa', '2026-12-25'),

(6, 5, 6, 'Abogado Especialista en Derecho Ambiental',
    'Codechoco requiere Abogado con especializacion en Derecho Ambiental para asesorar procesos de licenciamiento y sancionatorios ambientales en el departamento.',
    'Quibdo, Choco', 'presencial', 'indefinido', 4200000, 5500000, FALSE, 134, 'activa', '2027-01-10');

-- =========================================
-- REQUISITOS Y BENEFICIOS
-- (ejemplo completo solo para la oferta 1, Enfermera Jefe)
-- =========================================

INSERT INTO requisito_oferta (id_oferta, descripcion) VALUES
(1, 'Titulo profesional en Enfermeria'),
(1, 'Especializacion en Gestion de Salud o afin'),
(1, 'Minimo 3 anos de experiencia en cargos similares'),
(1, 'Registro y tarjeta profesional vigente'),
(1, 'Conocimiento en normatividad sanitaria colombiana');

INSERT INTO beneficio_oferta (id_oferta, descripcion) VALUES
(1, 'Salario competitivo mas prestaciones de ley'),
(1, 'Seguro medico para empleado y familia'),
(1, 'Auxilios educativos'),
(1, '30 dias de vacaciones'),
(1, 'Estabilidad laboral');

-- =========================================
-- POSTULACIONES DE EJEMPLO
-- =========================================

INSERT INTO postulacion (id_oferta, id_candidato, estado) VALUES
(1, 1, 'en_revision'),
(2, 2, 'enviada'),
(4, 4, 'preseleccionado'),
(5, 5, 'enviada');

-- =========================================
-- OFERTAS GUARDADAS DE EJEMPLO
-- =========================================

INSERT INTO oferta_guardada (id_candidato, id_oferta) VALUES
(1, 4),
(3, 3),
(5, 6);

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
