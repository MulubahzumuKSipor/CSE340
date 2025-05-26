INSERT INTO account (
  account_first_name,
  account_last_name,
  account_email,
  account_password
)
VALUES 
	('Tony', 
	'Stark', 
	'tony@starkent.com', 
	'Iam1ronM@n'
	);

SELECT *
FROM account;

UPDATE account
SET account_type = 'admin'
WHERE account_first_name = 'Tony';

DELETE FROM account
WHERE account_email = 'tony@starkent.com';

UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small', 'large' )
WHERE inv_model = 'Hummer';

SELECT inv_make, 
		inv_model, 
		classification.classification_name AS classification_name 
		from 
		inventory
		INNER JOIN
		classification
		ON inventory.classification_id = classification.classification_id
		WHERE 
		classification.classification_name = 'Sport';

UPDATE inventory
SET
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

