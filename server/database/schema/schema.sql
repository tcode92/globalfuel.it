
-- Drop the table if it exists
DROP TABLE IF EXISTS "auth" CASCADE;
DROP INDEX IF EXISTS idx_auth_email;
DROP INDEX IF EXISTS idx_auth_id;
DROP TYPE IF EXISTS auth_role;
CREATE TYPE auth_role AS ENUM ('admin', 'agency', 'system');
-- Create the user table
CREATE TABLE "auth" (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    role auth_role NOT NULL DEFAULT 'admin',
    password VARCHAR NOT NULL,
    actions JSON DEFAULT '{}',
    clients INT NOT NULL DEFAULT 0,
    rv VARCHAR,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_email ON auth(email);
CREATE INDEX IF NOT EXISTS idx_auth_id ON auth(id);
DROP TABLE IF EXISTS "auth_token" CASCADE;
CREATE TABLE "auth_token" (
    auth_id INT NOT NULL REFERENCES auth(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    CONSTRAINT unique_auth_id_token UNIQUE (auth_id, token),
    CONSTRAINT unique_auth_id UNIQUE (auth_id)
);
DROP TABLE IF EXISTS "client" CASCADE;
-- Create the client table
CREATE TABLE "client" (
    id SERIAL PRIMARY KEY,
    business VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    vat VARCHAR(11) NOT NULL UNIQUE,
    phone VARCHAR NOT NULL,
    pec VARCHAR NOT NULL,
    address JSON NOT NULL,
    CONSTRAINT valid_address CHECK (
        (json_typeof(address) = 'object')
        AND (json_typeof(address -> 'street') = 'string')
        AND (json_typeof(address -> 'postalCode') = 'string')
        AND (json_typeof(address -> 'province') = 'string')
    ),
    fg VARCHAR,
    code VARCHAR(15),
    state VARCHAR NOT NULL DEFAULT 'In Lavorazione',
    type VARCHAR,
    sdi VARCHAR,
    business_start DATE,
    cf VARCHAR(16),
    fax VARCHAR,
    auth_id INT NOT NULL REFERENCES auth(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_auth_id FOREIGN KEY (auth_id) REFERENCES auth (id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_client_business ON client(business);
CREATE INDEX IF NOT EXISTS idx_client_email ON client(email);
CREATE INDEX IF NOT EXISTS idx_client_vat ON client(vat);
CREATE INDEX IF NOT EXISTS idx_client_auth_id ON client(auth_id);
DROP TABLE IF EXISTS "file" CASCADE;
CREATE TABLE "file" (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    src VARCHAR NOT NULL,
    ext VARCHAR NOT NULL,
    mime VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    client_id INT NOT NULL REFERENCES client(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_client_id FOREIGN KEY (client_id) REFERENCES client (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_file_client_id ON file(client_id);
CREATE INDEX IF NOT EXISTS idx_file_src ON file(src);
DROP TABLE IF EXISTS "note" CASCADE;
CREATE TABLE "note" (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES client(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_note_client_id FOREIGN KEY (client_id) REFERENCES client (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_note_client_id ON note(client_id);


DROP TABLE IF EXISTS "messages" CASCADE;

CREATE TABLE
    messages (
        id SERIAL PRIMARY KEY,
        auth_id INT REFERENCES auth (id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        client_id INT REFERENCES client (id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

DROP TABLE IF EXISTS "message_ack" CASCADE;
CREATE TABLE message_ack (
    msg_id INT REFERENCES messages(id) ON DELETE CASCADE,
    auth_id INT REFERENCES auth(id) ON DELETE CASCADE, -- auth_id is set only when the message is to be acked by agency
    ack BOOLEAN DEFAULT FALSE,
    ack_at TIMESTAMPTZ DEFAULT NULL

);
-- Create the trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
-- Create the trigger for "auth" table
CREATE TRIGGER trigger_update_updated_at_auth
BEFORE UPDATE ON "auth"
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create the trigger for "client" table
CREATE TRIGGER trigger_update_updated_at_client
BEFORE UPDATE ON "client"
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create the trigger for "file" table
CREATE TRIGGER trigger_update_updated_at_file
BEFORE UPDATE ON "file"
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- Create the trigger for "file" table
CREATE TRIGGER trigger_update_updated_at_file
BEFORE UPDATE ON "note"
FOR EACH ROW EXECUTE FUNCTION update_updated_at();




-- Trigger function to increment the clients count when a new client is created
CREATE OR REPLACE FUNCTION increment_clients_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auth
    SET clients = clients + 1
    WHERE id = NEW.auth_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to decrement the clients count when a client is deleted
CREATE OR REPLACE FUNCTION decrement_clients_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auth
    SET clients = clients - 1
    WHERE id = OLD.auth_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the increment_clients_count function on client creation
CREATE TRIGGER increment_clients_trigger
AFTER INSERT ON client
FOR EACH ROW
EXECUTE FUNCTION increment_clients_count();
-- Trigger to call the decrement_clients_count function on client deletion
CREATE TRIGGER decrement_clients_trigger
AFTER DELETE ON client
FOR EACH ROW
EXECUTE FUNCTION decrement_clients_count();



-- Trigger function to update clients count when auth_id of a client is changed
CREATE OR REPLACE FUNCTION update_clients_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auth
    SET clients = clients - 1
    WHERE id = OLD.auth_id;

    UPDATE auth
    SET clients = clients + 1
    WHERE id = NEW.auth_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Trigger to call the update_clients_count function on client auth_id change
CREATE TRIGGER update_clients_trigger
AFTER UPDATE OF auth_id ON client
FOR EACH ROW
WHEN (OLD.auth_id IS DISTINCT FROM NEW.auth_id)
EXECUTE FUNCTION update_clients_count();




-- create default user.
INSERT INTO auth (name, email, role, password) VALUES ('Petrol Service', '', 'system', 'nologin');