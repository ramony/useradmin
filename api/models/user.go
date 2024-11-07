package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `gorm:"unique;not null" json:"username"`
	Password string `json:"password"`
	RoleID   uint   `json:"role_id"`
	Status   int    `json:"status"` // 0: 禁用, 1: 启用
	Role     Role   `gorm:"foreignKey:RoleID" json:"role"`
} 