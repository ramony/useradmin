package models

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"log"
)

// InitData 初始化基础数据
func InitData(db *gorm.DB) error {
	// 自动迁移表结构
	if err := db.AutoMigrate(&Permission{}, &Role{}, &RolePermission{}); err != nil {
		return err
	}

	// 创建默认权限
	for _, perm := range DefaultPermissions {
		var count int64
		db.Model(&Permission{}).Where("code = ?", perm.Code).Count(&count)
		if count == 0 {
			if err := db.Create(&perm).Error; err != nil {
				return err
			}
		}
	}

	// 创建超级管理员角色
	var adminRole Role
	if err := db.FirstOrCreate(&adminRole, Role{
		Name: "超级管理员",
		Description: "系统超级管理员",
	}).Error; err != nil {
		return err
	}

	// 为超级管理员分配所有权限
	var permissions []Permission
	if err := db.Find(&permissions).Error; err != nil {
		return err
	}
	if err := db.Model(&adminRole).Association("Permissions").Replace(permissions); err != nil {
		return err
	}

	// 创建超级管理员用户
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	adminUser := User{
		Username: "admin",
		Password: string(hashedPassword),
		RoleID:   adminRole.ID,
		Status:   1,
	}

	var count int64
	db.Model(&User{}).Where("username = ?", adminUser.Username).Count(&count)
	if count == 0 {
		if err := db.Create(&adminUser).Error; err != nil {
			return err
		}
		log.Printf("创建管理员用户成功: %s", adminUser.Username)
	}

	return nil
} 