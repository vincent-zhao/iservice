CREATE TABLE `duplicates` (
  `autokid` int(10) unsigned NOT NULL auto_increment,
  `userid` varchar(64) NOT NULL default '',
  `path` varchar(1024) NOT NULL default '',
  `node_type` char(1) NOT NULL default 'F',
  `content` MEDIUMTEXT NOT NULL default '',
  `origin_md5` varchar(64) NOT NULL default '', 
  `addtime` DATETIME NOT NULL default '0000-00-00 00:00:00',
  `modtime` DATETIME NOT NULL default '0000-00-00 00:00:00',
  `version` int(10) unsigned NOT NULL default 0,
  `state` int(2) unsigned NOT NULL default 0,
  PRIMARY KEY  (`autokid`),
  KEY `idx_userid` (`userid`),
  KEY `idx_userid_path` (`userid`,`path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8


CREATE TABLE `acl_control` (
  `autokid` int(10) unsigned NOT NULL auto_increment,
  `userid` varchar(64) NOT NULL default '',
  `path` varchar(1024) NOT NULL default '',
  `useracl` int(2) unsigned NOT NULL default 1,
  PRIMARY KEY (`autokid`),
  KEY `idx_userid_path` (`userid`,`path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8


CREATE TABLE `task_queue` (
  `taskid` int(10) unsigned NOT NULL auto_increment,
  `userid` varchar(64) NOT NULL default '',
  `version` int(10) unsigned NOT NULL default 0,
  `state` tinyint(1) unsigned NOT NULL default 0,
  `addtime` DATETIME NOT NULL default '0000-00-00 00:00:00',
  `checktime` DATETIME NOT NULL default '0000-00-00 00:00:00',
  `adminid` varchar(64) NOT NULL default '',
  `token` varchar(64) NOT NULL default '',
  `attachment` varchar(1024) NOT NULL default '', 
  PRIMARY KEY (`taskid`),
  KEY `idx_userid` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8


CREATE TABLE `client_session` (
  `autokid` int(10) unsigned NOT NULL auto_increment,
  `ip` varchar(16) NOT NULL default '000.000.000.000',
  `pid` int(5) NOT NULL default 0,
  `path` varchar(1024) NOT NULL default '',
  `path_version` int(10) NOT NULL default 0,
  `addtime` DATETIME NOT NULL default '0000-00-00 00:00:00',
  PRIMARY KEY  (`autokid`),
  KEY `idx_path` (`path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8

