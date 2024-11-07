package controllers

import (
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"log"
	"strconv"
	"useradmin/api/config"
	"useradmin/api/middleware"
	"useradmin/api/models"
	"fmt"
)

// LoginRequest 登录请求结构
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// CreateUserRequest 创建用户请求结构
type CreateUserRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	RoleID   uint   `json:"role_id" binding:"required"`
	Status   int    `json:"status"`
}

// UpdateUserRequest 更新用户请求结构
type UpdateUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	RoleID   uint   `json:"role_id"`
	Status   int    `json:"status"`
}

// Login 处理用户登录
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "无效的请求参数"})
		return
	}

	var user models.User
	if err := config.DB.Preload("Role.Permissions").Where("username = ?", req.Username).First(&user).Error; err != nil {
		log.Printf("查询用户失败: %v", err)
		c.JSON(401, gin.H{"error": "用户名或密码错误"})
		return
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		log.Printf("密码验证失败: %v", err)
		c.JSON(401, gin.H{"error": "用户名或密码错误"})
		return
	}

	// 生成 JWT token
	token, err := middleware.GenerateToken(user.Username)
	if err != nil {
		log.Printf("生成token失败: %v", err)
		c.JSON(500, gin.H{"error": "生成token失败"})
		return
	}

	// 获取用户权限列表
	var permissions []string
	for _, perm := range user.Role.Permissions {
		permissions = append(permissions, perm.Code)
	}

	c.JSON(200, gin.H{
		"token": token,
		"user": gin.H{
			"id":          user.ID,
			"username":    user.Username,
			"role_id":     user.RoleID,
			"role_name":   user.Role.Name,
			"permissions": permissions,
			"status":      user.Status,
		},
	})
}

// GetUsers 获取用户列表
func GetUsers(c *gin.Context) {
	var users []models.User
	if err := config.DB.Preload("Role").Find(&users).Error; err != nil {
		c.JSON(500, gin.H{"error": "获取用户列表失败"})
		return
	}

	c.JSON(200, users)
}

// CreateUser 创建用户
func CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "无效的请求参数" + fmt.Sprintf("%s %s", err, req)})
		return
	}

	// 检查用户名是否已存在
	var count int64
	config.DB.Model(&models.User{}).Where("username = ?", req.Username).Count(&count)
	if count > 0 {
		c.JSON(400, gin.H{"error": "用户名已存在"})
		return
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "密码加密失败"})
		return
	}

	user := models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		RoleID:   req.RoleID,
		Status:   req.Status,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(500, gin.H{"error": "创建用户失败"})
		return
	}

	c.JSON(200, user)
}

// UpdateUser 更新用户
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "用户不存在"})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "无效的请求参数"})
		return
	}

	// 只更新允许修改的字段
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(500, gin.H{"error": "密码加密失败"})
			return
		}
		user.Password = string(hashedPassword)
	}

	if req.RoleID != 0 {
			user.RoleID = req.RoleID
	}

	user.Status = req.Status

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(500, gin.H{"error": "更新用户失败"})
		return
	}

	// 重新加载用户信息，包括角色信息
	if err := config.DB.Preload("Role").First(&user, user.ID).Error; err != nil {
		c.JSON(500, gin.H{"error": "获取更新后的用户信息失败"})
		return
	}

	c.JSON(200, user)
}

// DeleteUser 删除用户
func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	
	// 不允许删除超级管理员
	if id == "1" {
		c.JSON(403, gin.H{"error": "不能删除超级管理员"})
		return
	}

	if err := config.DB.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(500, gin.H{"error": "删除用户失败"})
		return
	}

	c.JSON(200, gin.H{"message": "用户已删除"})
}

// GetUserInfo 获取当前登录用户信息
func GetUserInfo(c *gin.Context) {
	username := c.GetString("username")
	if username == "" {
		c.JSON(401, gin.H{"error": "未登录"})
		return
	}

	var user models.User
	if err := config.DB.Preload("Role.Permissions").Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(404, gin.H{"error": "用户不存在"})
		return
	}

	// 获取用户权限列表
	var permissions []string
	for _, perm := range user.Role.Permissions {
		permissions = append(permissions, perm.Code)
	}

	c.JSON(200, gin.H{
		"id":          user.ID,
		"username":    user.Username,
		"role_id":     user.RoleID,
		"role_name":   user.Role.Name,
		"permissions": permissions,
		"status":      user.Status,
		"created_at":  user.CreatedAt,
		"updated_at":  user.UpdatedAt,
	})
}

// GetUserDetail 获取指定用户详细信息
func GetUserDetail(c *gin.Context) {
	id := c.Param("id")
	
	var user models.User
	if err := config.DB.Preload("Role.Permissions").First(&user, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "用户不存在"})
		return
	}

	// 获取用户权限列表
	var permissions []string
	for _, perm := range user.Role.Permissions {
		permissions = append(permissions, perm.Code)
	}

	c.JSON(200, gin.H{
		"id":          user.ID,
		"username":    user.Username,
		"role_id":     user.RoleID,
		"role_name":   user.Role.Name,
		"permissions": permissions,
		"status":      user.Status,
		"created_at":  user.CreatedAt,
		"updated_at":  user.UpdatedAt,
	})
}

// GetUserList 获取用户列表
func GetUserList(c *gin.Context) {
	// 获取分页参数
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")
	
	// 转换分页参数
	pageNum, _ := strconv.Atoi(page)
	limit, _ := strconv.Atoi(pageSize)
	offset := (pageNum - 1) * limit

	var users []models.User
	query := config.DB.Preload("Role")

	// 获取总数
	var total int64
	query.Model(&models.User{}).Count(&total)

	// 获取分页数据
	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		c.JSON(500, gin.H{"error": "获取用户列表失败"})
		return
	}

	// 构造响应数据
	var responseUsers []gin.H
	for _, user := range users {
			responseUsers = append(responseUsers, gin.H{
				"id":       user.ID,
				"username": user.Username,
				"role_id":  user.RoleID,
				"role":     user.Role,
				"status":   user.Status,
			})
	}

	c.JSON(200, gin.H{
		"total": total,
		"page": pageNum,
		"page_size": limit,
		"data": responseUsers,
	})
} 