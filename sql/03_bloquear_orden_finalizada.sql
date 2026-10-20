-- Impide modificar una orden, o su detalle, cuando ya está finalizada.
-- El paso de abierta o en_proceso a finalizada sigue permitido.

CREATE OR REPLACE FUNCTION impedir_edicion_orden_finalizada()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado = 'finalizada' THEN
        RAISE EXCEPTION 'No se puede modificar una orden finalizada'
            USING ERRCODE = 'P0001';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orden_finalizada_inmutable ON ordenes;

CREATE TRIGGER trg_orden_finalizada_inmutable
BEFORE UPDATE OR DELETE ON ordenes
FOR EACH ROW
EXECUTE FUNCTION impedir_edicion_orden_finalizada();

CREATE OR REPLACE FUNCTION impedir_edicion_detalle_orden_finalizada()
RETURNS TRIGGER AS $$
DECLARE
    orden_estado VARCHAR(20);
    orden_objetivo BIGINT;
BEGIN
    orden_objetivo := COALESCE(NEW.orden_id, OLD.orden_id);

    SELECT estado INTO orden_estado
    FROM ordenes
    WHERE id = orden_objetivo;

    IF orden_estado = 'finalizada' THEN
        RAISE EXCEPTION 'No se puede modificar una orden finalizada'
            USING ERRCODE = 'P0001';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_detalle_orden_finalizada_inmutable ON detalle_orden;

CREATE TRIGGER trg_detalle_orden_finalizada_inmutable
BEFORE INSERT OR UPDATE OR DELETE ON detalle_orden
FOR EACH ROW
EXECUTE FUNCTION impedir_edicion_detalle_orden_finalizada();
