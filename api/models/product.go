package models

import (
	"gorm.io/gorm"
)

// Product 商品模型
type Product struct {
	gorm.Model
	Title       string         `json:"title" gorm:"not null"`              // 商品标题
	Description string         `json:"description"`                        // 商品描述
	Images      []ProductImage `json:"images" gorm:"foreignKey:ProductID"` // 商品图片
	Specs       []ProductSpec  `json:"specs" gorm:"foreignKey:ProductID"`  // 商品规格
	Status      int           `json:"status" gorm:"default:1"`            // 商品状态：1-上架，0-下架
	CreatedBy   uint          `json:"created_by"`                         // 创建人ID
	UpdatedBy   uint          `json:"updated_by"`                         // 更新人ID
}

// ProductImage 商品图片
type ProductImage struct {
	gorm.Model
	ProductID uint   `json:"product_id"`           // 商品ID
	URL       string `json:"url" gorm:"not null"`  // 图片URL
	Sort      int    `json:"sort" gorm:"default:0"` // 排序
}

// ProductSpec 商品规格
type ProductSpec struct {
	gorm.Model
	ProductID uint   `json:"product_id"`            // 商品ID
	Name      string `json:"name" gorm:"not null"`  // 规格名称
	Value     string `json:"value" gorm:"not null"` // 规格值
	Sort      int    `json:"sort" gorm:"default:0"` // 排序
} 