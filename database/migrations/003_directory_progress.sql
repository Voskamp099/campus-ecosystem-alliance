ALTER TABLE directory_applications
  ADD COLUMN tracking_code VARCHAR(32) NOT NULL DEFAULT '' AFTER directory_type,
  ADD COLUMN status_note VARCHAR(500) NOT NULL DEFAULT '' AFTER status,
  ADD UNIQUE KEY uniq_tracking_code (tracking_code);
