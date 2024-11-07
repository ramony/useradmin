package routes

import (
	"github.com/gin-gonic/gin"
	"useradmin/api/controllers"
	"useradmin/api/middleware"
)

func SetupRoutes(api *gin.RouterGroup) {
	// 公开接口
	api.POST("/login", controllers.Login)
	
	// 需要认证的路由
	auth := api.Group("/")
	auth.Use(middleware.JWTAuth())
	{
		// 用户信息
		auth.GET("/user/info", controllers.GetUserInfo)

		// 用户管理
		auth.GET("/users", middleware.CheckPermission("user:list"), controllers.GetUserList)
		auth.GET("/users/:id", middleware.CheckPermission("user:list"), controllers.GetUserDetail)
		auth.POST("/users", middleware.CheckPermission("user:create"), controllers.CreateUser)
		auth.PUT("/users/:id", middleware.CheckPermission("user:update"), controllers.UpdateUser)
		auth.DELETE("/users/:id", middleware.CheckPermission("user:delete"), controllers.DeleteUser)

		// 角色管理
		auth.GET("/roles", middleware.CheckPermission("role:list"), controllers.GetRoles)
		auth.POST("/roles", middleware.CheckPermission("role:create"), controllers.CreateRole)
		auth.PUT("/roles/:id", middleware.CheckPermission("role:update"), controllers.UpdateRole)
		auth.DELETE("/roles/:id", middleware.CheckPermission("role:delete"), controllers.DeleteRole)

		// 权限管理
		auth.GET("/permissions", middleware.CheckPermission("role:list"), controllers.GetPermissions)
		auth.POST("/permissions", middleware.CheckPermission("role:create"), controllers.CreatePermission)
		auth.PUT("/permissions/:id", middleware.CheckPermission("role:update"), controllers.UpdatePermission)
		auth.DELETE("/permissions/:id", middleware.CheckPermission("role:delete"), controllers.DeletePermission)

		// 日志查询
		auth.GET("/logs", middleware.CheckPermission("log:list"), controllers.GetLogs)
		auth.GET("/logs/types", middleware.CheckPermission("log:list"), controllers.GetLogTypes)
		auth.GET("/logs/stats", middleware.CheckPermission("log:list"), controllers.GetLogStats)

		// 商品管理
		auth.GET("/products", middleware.CheckPermission("product:list"), controllers.GetProducts)
		auth.POST("/products", middleware.CheckPermission("product:create"), controllers.CreateProduct)
		auth.GET("/products/:id", middleware.CheckPermission("product:list"), controllers.GetProduct)
		auth.PUT("/products/:id", middleware.CheckPermission("product:update"), controllers.UpdateProduct)
		auth.DELETE("/products/:id", middleware.CheckPermission("product:delete"), controllers.DeleteProduct)

		// 文件上传
		auth.POST("/upload/image", middleware.CheckPermission("product:update"), controllers.UploadImage)
	}
} 