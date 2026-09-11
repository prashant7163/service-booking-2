CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE account (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email = lower(btrim(email))),
    display_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL CHECK (password_hash LIKE '$2%'),
    role VARCHAR(32) NOT NULL CHECK (role IN ('CUSTOMER', 'PROVIDER', 'ADMINISTRATOR')),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    suspended BOOLEAN NOT NULL DEFAULT FALSE,
    session_version BIGINT NOT NULL DEFAULT 0,
    UNIQUE (id, role),
    CHECK (NOT suspended OR role = 'PROVIDER')
);
CREATE TABLE verification_credential (
    token_digest CHAR(64) PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    kind VARCHAR(32) NOT NULL CHECK (kind IN ('CUSTOMER_VERIFICATION', 'PROVIDER_VERIFICATION', 'PASSWORD_RESET')),
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX verification_account_idx ON verification_credential(account_id);
CREATE TABLE spring_session (
    primary_id CHAR(36) NOT NULL PRIMARY KEY,
    session_id CHAR(36) NOT NULL UNIQUE,
    creation_time BIGINT NOT NULL,
    last_access_time BIGINT NOT NULL,
    max_inactive_interval INTEGER NOT NULL,
    expiry_time BIGINT NOT NULL,
    principal_name VARCHAR(100)
);
CREATE INDEX spring_session_expiry_idx ON spring_session(expiry_time);
CREATE INDEX spring_session_principal_idx ON spring_session(principal_name);
CREATE TABLE spring_session_attributes (
    session_primary_id CHAR(36) NOT NULL REFERENCES spring_session(primary_id) ON DELETE CASCADE,
    attribute_name VARCHAR(200) NOT NULL,
    attribute_bytes BYTEA NOT NULL,
    PRIMARY KEY (session_primary_id, attribute_name)
);
CREATE TABLE category (
    code VARCHAR(32) PRIMARY KEY CHECK (code IN ('TUTOR_LESSON', 'BEAUTY_WELLNESS'))
);
INSERT INTO category(code) VALUES ('TUTOR_LESSON'), ('BEAUTY_WELLNESS');
CREATE TABLE shop (
    id UUID PRIMARY KEY,
    provider_id UUID NOT NULL UNIQUE,
    provider_role VARCHAR(32) NOT NULL DEFAULT 'PROVIDER' CHECK (provider_role = 'PROVIDER'),
    name VARCHAR(255) NOT NULL,
    street VARCHAR(255),
    postal_code VARCHAR(4) CHECK (postal_code ~ '^[0-9]{4}$'),
    city VARCHAR(255),
    country VARCHAR(2) CHECK (country = 'CH'),
    FOREIGN KEY (provider_id, provider_role) REFERENCES account(id, role),
    UNIQUE (id, provider_id)
);
CREATE TABLE offering (
    id UUID PRIMARY KEY,
    shop_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    name_en TEXT,
    name_de TEXT,
    name_language VARCHAR(2) NOT NULL CHECK (name_language IN ('en', 'de')),
    description_en TEXT,
    description_de TEXT,
    description_language VARCHAR(2) CHECK (description_language IN ('en', 'de')),
    category_code VARCHAR(32) REFERENCES category(code),
    price_chf NUMERIC(12,2) CHECK (price_chf > 0),
    state VARCHAR(16) NOT NULL DEFAULT 'DRAFT' CHECK (state IN ('DRAFT', 'PUBLISHED')),
    FOREIGN KEY (shop_id, provider_id) REFERENCES shop(id, provider_id),
    UNIQUE (id, provider_id)
);
CREATE TABLE slot (
    id UUID PRIMARY KEY,
    offering_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    published BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (offering_id, provider_id) REFERENCES offering(id, provider_id),
    CHECK (start_at < end_at),
    EXCLUDE USING gist (provider_id WITH =, tstzrange(start_at, end_at, '[)') WITH &&) WHERE (published)
);
CREATE INDEX slot_offering_idx ON slot(offering_id);
