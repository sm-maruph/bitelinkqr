begin;

-- Staff creation needs only INSERT. Password reads and updates remain available
-- exclusively to the trusted authentication service connection.
grant insert on app.user_credentials to bitelink_api;

commit;
