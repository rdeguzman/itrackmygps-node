DROP TABLE locations;

CREATE TABLE locations
(
  id serial NOT NULL,
  device_id varchar(100),
  gps_timestamp bigint NOT NULL DEFAULT 0,
  gps_latitude double precision NOT NULL DEFAULT 0.0,
  gps_longitude double precision NOT NULL DEFAULT 0.0,
  gps_speed double precision,
  gps_heading double precision,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  CONSTRAINT locations_pkey PRIMARY KEY (id )
);
ALTER TABLE locations OWNER TO rupert;
