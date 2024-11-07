package main

import (
	"log"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"gorm.io/gorm"
	"gorm.io/driver/mysql"
	"useradmin/api/config"
	"useradmin/api/models"
	"useradmin/api/middleware"
	"useradmin/api/routes"
)

func main() {
	// 初始化配置
	cfg := config.GetConfig()

	// 设置 gin 模式
	gin.SetMode(cfg.Server.Mode)

	// 连接数据库
	db, err := gorm.Open(mysql.Open(cfg.MySQL.DSN), &gorm.Config{})
	if err != nil {
		log.Fatal("数据库连接失败:", err)
	}
	
	// 初始化全局数据库连接
	config.InitDB(db)

	// 自动迁移数据库结构
	db.AutoMigrate(&models.User{}, &models.Role{}, &models.Permission{}, &models.Log{}, &models.Product{}, &models.ProductImage{}, &models.ProductSpec{})

	// 初始化基础数据
	if err := models.InitData(db); err != nil {
		log.Fatal("初始化数据失败:", err)
	}

	// 初始化 Gin
	r := gin.Default()

	// 配置CORS，允许所有域名访问
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},                                          // 允许所有域名
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,  // 当 AllowOrigins 为 * 时，必须设置为 false
		MaxAge:           12 * 60 * 60, // 预检请求结果缓存12小时
	}))

	// 配置静态文件服务
	r.Static("/uploads", "./uploads")

	// 添加日志中间件
	r.Use(middleware.Logger())

	// API 路由组
	api := r.Group("/api")
	{
		// 设置路由
		routes.SetupRoutes(api)
	}

	// 启动服务器
	log.Println("服务器启动在 :8080 端口")
	r.Run(":8080")
} 