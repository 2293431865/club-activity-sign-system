-- =====================================================================
-- 校园社团活动报名与签到系统 - 数据库脚本
-- 说明：本脚本用于创建该系统的 MySQL 数据库与数据表。
-- 项目前端（app.js）演示时数据存于浏览器 localStorage；
-- 如需接入 MySQL 后端，可直接使用本脚本建库建表。
-- 初始账号与前端示例一致：管理员 admin/admin123，学生 student/123456
-- 适用：MySQL 8.0
-- =====================================================================

CREATE DATABASE IF NOT EXISTS club_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE club_system;

-- ---------------------------------------------------------------
-- 1. 用户表（对应前端 accounts / me：管理员、学生）
-- ---------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`         INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户id',
  `account`    VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号',
  `password`   VARCHAR(50) NOT NULL COMMENT '密码',
  `name`       VARCHAR(50) NOT NULL COMMENT '姓名',
  `role`       VARCHAR(20) NOT NULL COMMENT '角色：admin管理员 / student学生',
  `student_id` VARCHAR(20) COMMENT '学号（学生）',
  `college`    VARCHAR(50) COMMENT '学院',
  `phone`      VARCHAR(20) COMMENT '手机号',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 初始账号：管理员 admin / admin123；学生 student / 123456（张小明）
INSERT INTO `users`(`account`,`password`,`name`,`role`,`student_id`,`college`,`phone`) VALUES
('admin',  'admin123', '系统管理员', 'admin',   NULL,       NULL,        NULL),
('student','123456',   '张小明',    'student', '20240001', '计算机学院', '13800001111');

-- ---------------------------------------------------------------
-- 2. 活动表（对应前端 activities）
-- ---------------------------------------------------------------
DROP TABLE IF EXISTS `activities`;
CREATE TABLE `activities` (
  `id`                     INT PRIMARY KEY AUTO_INCREMENT COMMENT '活动id',
  `name`                   VARCHAR(100) NOT NULL COMMENT '活动名称',
  `description`            TEXT COMMENT '活动详情',
  `location`               VARCHAR(100) COMMENT '活动地点',
  `start_time`             DATETIME COMMENT '开始时间',
  `end_time`               DATETIME COMMENT '结束时间',
  `registration_deadline`  DATETIME COMMENT '报名截止时间',
  `capacity`               INT DEFAULT 0 COMMENT '人数上限',
  `status`                 VARCHAR(20) DEFAULT 'active' COMMENT '状态：active进行中 / closed已结束 / draft草稿',
  `organizer`              VARCHAR(50) COMMENT '主办社团/组织',
  `create_time`            DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动表';

-- 示例活动
INSERT INTO `activities`(`name`,`description`,`location`,`start_time`,`end_time`,`registration_deadline`,`capacity`,`status`,`organizer`) VALUES
('校园马拉松 · 春季赛','全程约 5 公里，环绕校园主路跑。设男女冠亚季军，完赛发放纪念奖牌与素质拓展学分证明。','学校东门广场','2026-03-08 08:00:00','2026-03-08 11:00:00','2026-03-07 18:00:00',200,'active','跑步爱好者协会'),
('编程马拉松 Hackathon','24 小时团队编程挑战赛，主题为「智慧校园」。三人一组，现场提供餐饮与夜宵，决赛路演评选最佳创意与最佳工程奖。','信息楼 3 层报告厅','2026-03-10 09:00:00','2026-03-11 09:00:00','2026-03-09 20:00:00',120,'active','ACM 算法协会');

-- ---------------------------------------------------------------
-- 3. 报名表（对应前端 registrations）
-- ---------------------------------------------------------------
DROP TABLE IF EXISTS `registrations`;
CREATE TABLE `registrations` (
  `id`           INT PRIMARY KEY AUTO_INCREMENT COMMENT '报名id',
  `activity_id`  INT NOT NULL COMMENT '活动id，关联 activities.id',
  `student_name` VARCHAR(50) NOT NULL COMMENT '学生姓名',
  `student_id`   VARCHAR(20) NOT NULL COMMENT '学号',
  `college`      VARCHAR(50) COMMENT '学院',
  `phone`        VARCHAR(20) COMMENT '手机号',
  `status`       VARCHAR(20) DEFAULT 'pending' COMMENT '状态：approved已通过 / pending待审核 / cancelled已取消',
  `created_at`   DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
  UNIQUE KEY `uk_reg_activity_student` (`activity_id`,`student_id`),
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动报名表';

-- 示例报名（对应前端 r1-r4 等）
INSERT INTO `registrations`(`activity_id`,`student_name`,`student_id`,`college`,`phone`,`status`,`created_at`) VALUES
(1,'张小明','20240001','计算机学院','13800001111','approved','2026-03-05 10:00:00'),
(1,'李华','20230012','外国语学院','13900002222','approved','2026-03-05 11:00:00'),
(1,'王芳','20220034','经管学院','13700003333','approved','2026-03-06 09:00:00'),
(1,'赵强','20210056','机械学院','13600004444','pending','2026-03-07 15:00:00'),
(2,'陈静','20240078','计算机学院','13500005555','approved','2026-03-04 14:00:00'),
(2,'刘洋','20240090','电子学院','13400006666','approved','2026-03-05 16:00:00');

-- ---------------------------------------------------------------
-- 4. 签到表（对应前端 checkIns）
-- ---------------------------------------------------------------
DROP TABLE IF EXISTS `checkins`;
CREATE TABLE `checkins` (
  `id`              INT PRIMARY KEY AUTO_INCREMENT COMMENT '签到id',
  `activity_id`     INT NOT NULL COMMENT '活动id',
  `registration_id` INT NOT NULL COMMENT '报名id，关联 registrations.id',
  `student_name`    VARCHAR(50) COMMENT '学生姓名',
  `student_id`      VARCHAR(20) COMMENT '学号',
  `checkin_time`    DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '签到时间',
  UNIQUE KEY `uk_checkin_activity_student` (`activity_id`,`student_id`),
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`),
  FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签到表';

-- 示例签到（对应前端 c1-c3 等）
INSERT INTO `checkins`(`activity_id`,`registration_id`,`student_name`,`student_id`,`checkin_time`) VALUES
(2,1,'张小明','20240001','2026-03-10 13:30:00'),
(2,2,'李华','20230012','2026-03-10 13:45:00'),
(2,5,'陈静','20240078','2026-03-10 18:40:00');
