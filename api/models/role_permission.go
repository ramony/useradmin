package models

// RolePermission 角色权限关联表
type RolePermission struct {
    RoleID       uint `gorm:"primaryKey;not null" json:"role_id"`
    PermissionID uint `gorm:"primaryKey;not null" json:"permission_id"`
    Role         Role       `gorm:"foreignKey:RoleID" json:"-"`
    Permission   Permission `gorm:"foreignKey:PermissionID" json:"-"`
}

// TableName 指定表名
func (RolePermission) TableName() string {
    return "role_permissions"
} 