package controllers

import (
	"net/http"
	"strings"
	"strconv"
	"useradmin/api/config"
	"useradmin/api/models"
	"github.com/gin-gonic/gin"
)

// GetRoles 获取角色列表
func GetRoles(c *gin.Context) {
	var roles []models.Role
	if err := config.DB.Preload("Permissions").Find(&roles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取角色列表失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": roles})
}

// CreateRole 创建角色
func CreateRole(c *gin.Context) {
	var role models.Role
	if err := c.ShouldBindJSON(&role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求参数"})
		return
	}

	// 检查角色名是否已存在
	var count int64
	if err := config.DB.Model(&models.Role{}).Where("name = ?", role.Name).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "检查角色名失败"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "角色名已存在"})
		return
	}

	if err := config.DB.Create(&role).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建角色失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": role})
}

// UpdateRole 更新角色
func UpdateRole(c *gin.Context) {
	id := c.Param("id")

	// 不允许修改超级管理员角色
	if id == "1" {
		c.JSON(http.StatusForbidden, gin.H{"error": "不能修改超级管理员角色"})
		return
	}

	var role models.Role
	if err := config.DB.First(&role, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "角色不存在"})
		return
	}

	var updateData struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求参数"})
		return
	}

	// 如果更新名称，检查是否已存在
	if updateData.Name != "" && updateData.Name != role.Name {
		var count int64
		if err := config.DB.Model(&models.Role{}).Where("name = ?", updateData.Name).Count(&count).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "检查角色名失败"})
			return
		}

		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "角色名已存在"})
			return
		}
		role.Name = updateData.Name
	}

	role.Description = updateData.Description

	if err := config.DB.Save(&role).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新角色失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": role})
}

// DeleteRole 删除角色
func DeleteRole(c *gin.Context) {
	id := c.Param("id")

	// 不允许删除超级管理员角色
	if id == "1" {
		c.JSON(http.StatusForbidden, gin.H{"error": "不能删除超级管理员角色"})
		return
	}

	// 检查是否有用户正在使用该角色
	var count int64
	if err := config.DB.Model(&models.User{}).Where("role_id = ?", id).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "检查角色使用状态失败"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "该角色正在被使用，无法删除"})
		return
	}

	if err := config.DB.Delete(&models.Role{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除角色失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// GetPermissions 获取权限列表
func GetPermissions(c *gin.Context) {
	var permissions []models.Permission
	if err := config.DB.Order("code asc").Find(&permissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取权限列表失败"})
		return
	}

	// 按模块分组返回权限
	moduleMap := make(map[string][]models.Permission)
	for _, perm := range permissions {
		module := strings.Split(perm.Code, ":")[0]
		moduleMap[module] = append(moduleMap[module], perm)
	}

	c.JSON(http.StatusOK, gin.H{
		"data": permissions,
		"modules": moduleMap,
	})
}

// CreatePermission 创建权限
func CreatePermission(c *gin.Context) {
	var permission models.Permission
	if err := c.ShouldBindJSON(&permission); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求参数"})
		return
	}

	// 验证权限代码格式
	if !strings.Contains(permission.Code, ":") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "权限代码格式错误，应为 module:action"})
		return
	}

	// 检查权限代码是否已存在
	var count int64
	if err := config.DB.Model(&models.Permission{}).Where("code = ?", permission.Code).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "检查权限代码失败"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "权限代码已存在"})
		return
	}

	if err := config.DB.Create(&permission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建权限失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "创建成功",
		"data": permission,
	})
}

// UpdatePermission 更新权限
func UpdatePermission(c *gin.Context) {
	id := c.Param("id")
	var permission models.Permission
	if err := config.DB.First(&permission, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "权限不存在"})
		return
	}

	var updateData struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Code        string `json:"code"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求参数"})
		return
	}

	// 如果更新code，验证格式
	if updateData.Code != "" && !strings.Contains(updateData.Code, ":") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "权限代码格式错误，应为 module:action"})
		return
	}

	// 如果更新code，检查唯一性
	if updateData.Code != "" && updateData.Code != permission.Code {
		var count int64
		if err := config.DB.Model(&models.Permission{}).Where("code = ?", updateData.Code).Count(&count).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "检查权限代码失败"})
			return
		}

		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "权限代码已存在"})
			return
		}
		permission.Code = updateData.Code
	}

	if updateData.Name != "" {
		permission.Name = updateData.Name
	}
	permission.Description = updateData.Description

	if err := config.DB.Save(&permission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新权限失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "更新成功",
		"data": permission,
	})
}

// DeletePermission 删除权限
func DeletePermission(c *gin.Context) {
	id := c.Param("id")

	// 检查权限是否被角色使用
	var count int64
	if err := config.DB.Table("role_permissions").Where("permission_id = ?", id).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "检查权限使用状态失败"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "该权限正在被角色使用，无法删除"})
		return
	}

	if err := config.DB.Delete(&models.Permission{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除权限失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// GetRolePermissions 获取角色权限
func GetRolePermissions(c *gin.Context) {
	roleID := c.Param("id")
	id, err := strconv.ParseUint(roleID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "无效的角色ID",
		})
		return
	}
	
	var permissions []models.Permission
	result := config.DB.Table("role_permissions").
		Select("permissions.*").
		Joins("LEFT JOIN permissions ON role_permissions.permission_id = permissions.ID").
		Where("role_permissions.role_id = ?", uint(id)).
		Find(&permissions)
 
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "获取角色权限失败",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"data": permissions,
	})
}

// UpdateRolePermissions 更新角色权限
func UpdateRolePermissions(c *gin.Context) {
	roleID := c.Param("id")
	id, err := strconv.ParseUint(roleID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "无效的角色ID",
		})
		return
	}
	var requestBody struct {
		PermissionIDs []uint `json:"permission_ids"`
	}
	
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "无效的请求数据",
		})
		return
	}
	
	// 开启事务
	tx := config.DB.Begin()
	
	// 删除原有权限
	if err := tx.Table("role_permissions").Where("role_id = ?", uint(id)).Delete(nil).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "更新角色权限失败",
		})
		return
	}
	
	// 添加新权限
	for _, permID := range requestBody.PermissionIDs {
		rolePermission := models.RolePermission{
			RoleID:       uint(id),
			PermissionID: permID,
		}
		if err := tx.Create(&rolePermission).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "更新角色权限失败",
			})
			return
		}
	}
	
	tx.Commit()
	
	c.JSON(http.StatusOK, gin.H{
		"message": "角色权限更新成功",
	})
} 