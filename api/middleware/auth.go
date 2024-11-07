package middleware

import (
	"github.com/gin-gonic/gin"
	"useradmin/api/config"
	"useradmin/api/models"
)


// CheckPermission 检查权限中间件
func CheckPermission(requiredPermission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从上下文中获取用户名（由 JWTAuth 中间件设置）
		username, exists := c.Get("username")
		if !exists {
			c.JSON(401, gin.H{"error": "未授权"})
			c.Abort()
			return
		}

		// 查询用户及其权限
		var user models.User
		if err := config.DB.Preload("Role.Permissions").Where("username = ?", username).First(&user).Error; err != nil {
			c.JSON(401, gin.H{"error": "用户不存在"})
			c.Abort()
			return
		}

		// 检查用户状态
		if user.Status != 1 {
			c.JSON(403, gin.H{"error": "用户已被禁用"})
			c.Abort()
			return
		}

		// 超级管理员角色（ID=1）拥有所有权限
		if user.RoleID == 1 {
			c.Next()
			return
		}

		// 检查权限
		hasPermission := false
		for _, p := range user.Role.Permissions {
			if p.Code == requiredPermission {
				hasPermission = true
				break
			}
		}

		if !hasPermission {
			c.JSON(403, gin.H{"error": "没有权限"})
			c.Abort()
			return
		}

		c.Next()
	}
} 