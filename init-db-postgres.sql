DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_roles WHERE rolname = 'ms_admin'
  ) THEN
    CREATE ROLE ms_admin LOGIN PASSWORD 'MsUsuarios_2025!';
  END IF;
END
$$;
