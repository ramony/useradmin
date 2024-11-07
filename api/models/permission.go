package models

import "gorm.io/gorm"

type Permission struct {
    gorm.Model
    Name        string `gorm:"unique;not null" json:"name" binding:"required"`
    Description string `json:"description"`
    Code        string `gorm:"unique;not null" json:"code" binding:"required"`
}

var DefaultPermissions = []Permission{
    {Name: "用户列表", Description: "查看用户列表", Code: "user:list"},
    {Name: "创建用户", Description: "创建新用户", Code: "user:create"},
    {Name: "更新用户", Description: "更新用户信息", Code: "user:update"},
    {Name: "删除用户", Description: "删除用户", Code: "user:delete"},
    {Name: "角色列表", Description: "查看角色列表", Code: "role:list"},
    {Name: "创建角色", Description: "创建新角色", Code: "role:create"},
    {Name: "更新角色", Description: "更新角色信息", Code: "role:update"},
    {Name: "删除角色", Description: "删除角色", Code: "role:delete"},
    {Name: "日志查看", Description: "查看系统日志", Code: "log:list"},
    {Name: "商品列表", Description: "查看商品列表", Code: "product:list"},
    {Name: "创建商品", Description: "创建新商品", Code: "product:create"},
    {Name: "更新商品", Description: "更新商品信息", Code: "product:update"},
    {Name: "删除商品", Description: "删除商品", Code: "product:delete"},
    {Name: "商品上下架", Description: "商品上架和下架操作", Code: "product:status"},
    {Name: "创建权限", Description: "创建新权限", Code: "permission:create"},
    {Name: "更新权限", Description: "更新权限信息", Code: "permission:update"},
    {Name: "删除权限", Description: "删除权限", Code: "permission:delete"},
} 