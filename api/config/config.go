package config

import (
	"gorm.io/gorm"
)

var DB *gorm.DB

type Config struct {
	MySQL MySQLConfig
	JWT   JWTConfig
	Server ServerConfig
}

type MySQLConfig struct {
	DSN string
}

type JWTConfig struct {
	Secret string
	Expire int // token过期时间(小时)
}

type ServerConfig struct {
	Port int
	Mode string // gin mode: debug, release, test
}

func GetConfig() *Config {
	return &Config{
		MySQL: MySQLConfig{
			DSN: "rayuser:123456@tcp(192.168.0.107:3306)/jstoremini?charset=utf8&parseTime=true",
		},
		JWT: JWTConfig{
			Secret: "your-secret-key",
			Expire: 24, // 24小时
		},
		Server: ServerConfig{
			Port: 8080,
			Mode: "debug",
		},
	}
}

// InitDB 初始化数据库连接
func InitDB(db *gorm.DB) {
	DB = db
}

// GetDB 获取数据库连接
func GetDB() *gorm.DB {
	return DB
} 