--

USE meta_iservice_config;

DROP TABLE IF EXISTS client_session;
CREATE TABLE client_session (
  autokid bigint(20) unsigned not null primary key,
  addtime datetime not null default '0000-00-00 00:00:00',
  modtime int(10) not null default 0,
  sessid char(32) not null default '',
  ipaddr char(16) not null default '',
  cversion varchar(32) not null default '',
  nodepath varchar(1024) not null default '',
  sessdata text,
  UNIQUE KEY uk_id (sessid),
  KEY idx_time (modtime),
  KEY idx_path (nodepath(8), modtime)
) ENGINE = MyISAM DEFAULT CHARSET = UTF8;

