create database mrr;

CREATE USER mrr IDENTIFIED BY 'mrr';

GRANT ALL PRIVILEGES ON mrr.* TO 'mrr'@'%' identified by 'mrr';

grant all privileges on mrr.* to 'mrr'@'localhost' identified by 'mrr';