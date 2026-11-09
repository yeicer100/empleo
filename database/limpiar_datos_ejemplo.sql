-- Borra SOLO los datos de ejemplo (empresas, ofertas, candidatos, postulaciones
-- y guardadas de mentira). NO borra las cuentas que hayas creado desde la pagina
-- ni los sectores (categoria). Ejecutalo completo en MySQL Workbench.

USE quibdo_empleo;
SET SQL_SAFE_UPDATES = 0;

CREATE TEMPORARY TABLE tmp_u AS
  SELECT id_usuario FROM usuario WHERE password_hash LIKE 'hash_temporal%';
CREATE TEMPORARY TABLE tmp_e AS
  SELECT id_empresa FROM empresa WHERE id_usuario IN (SELECT id_usuario FROM tmp_u);
CREATE TEMPORARY TABLE tmp_c AS
  SELECT id_candidato FROM candidato WHERE id_usuario IN (SELECT id_usuario FROM tmp_u);
CREATE TEMPORARY TABLE tmp_o AS
  SELECT id_oferta FROM oferta WHERE id_empresa IN (SELECT id_empresa FROM tmp_e);

DELETE FROM oferta_guardada
  WHERE id_candidato IN (SELECT id_candidato FROM tmp_c)
     OR id_oferta IN (SELECT id_oferta FROM tmp_o);
DELETE FROM postulacion
  WHERE id_candidato IN (SELECT id_candidato FROM tmp_c)
     OR id_oferta IN (SELECT id_oferta FROM tmp_o);
DELETE FROM requisito_oferta WHERE id_oferta IN (SELECT id_oferta FROM tmp_o);
DELETE FROM beneficio_oferta WHERE id_oferta IN (SELECT id_oferta FROM tmp_o);
DELETE FROM oferta    WHERE id_oferta    IN (SELECT id_oferta FROM tmp_o);
DELETE FROM candidato WHERE id_candidato IN (SELECT id_candidato FROM tmp_c);
DELETE FROM empresa   WHERE id_empresa   IN (SELECT id_empresa FROM tmp_e);
DELETE FROM usuario   WHERE id_usuario   IN (SELECT id_usuario FROM tmp_u);

DROP TEMPORARY TABLE tmp_u, tmp_e, tmp_c, tmp_o;

-- Comprobacion (deben salir 0 filas de ejemplo):
SELECT COUNT(*) AS ofertas_restantes FROM oferta;
SELECT COUNT(*) AS empresas_restantes FROM empresa;
