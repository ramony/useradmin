package controllers

import (
	"github.com/gin-gonic/gin"
	"strconv"
	"useradmin/api/config"
	"useradmin/api/models"
)

// CreateProduct 创建商品
func CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(400, gin.H{"error": "无效的请求参数"})
		return
	}

	// 设置创建人ID
	if username, exists := c.Get("username"); exists {
		var user models.User
		if err := config.DB.Where("username = ?", username).First(&user).Error; err == nil {
			product.CreatedBy = user.ID
			product.UpdatedBy = user.ID
		}
	}

	if err := config.DB.Create(&product).Error; err != nil {
		c.JSON(500, gin.H{"error": "创建商品失败"})
		return
	}

	c.JSON(200, product)
}

// GetProducts 获取商品列表
func GetProducts(c *gin.Context) {
	// 获取分页参数
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")
	
	// 获取搜索参数
	title := c.Query("title")
	status := c.Query("status")
	
	// 转换分页参数
	pageNum, _ := strconv.Atoi(page)
	limit, _ := strconv.Atoi(pageSize)
	offset := (pageNum - 1) * limit

	var products []models.Product
	query := config.DB.Preload("Images").Preload("Specs")

	// 添加搜索条件
	if title != "" {
		query = query.Where("title LIKE ?", "%"+title+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// 获取总数
	var total int64
	query.Model(&models.Product{}).Count(&total)

	// 获取分页数据
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&products).Error; err != nil {
		c.JSON(500, gin.H{"error": "获取商品列表失败"})
		return
	}

	c.JSON(200, gin.H{
		"total": total,
		"page": pageNum,
		"page_size": limit,
		"data": products,
	})
}

// GetProduct 获取商品详情
func GetProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product
	if err := config.DB.Preload("Images").Preload("Specs").First(&product, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "商品不存在"})
		return
	}
	c.JSON(200, product)
}

// UpdateProduct 更新商品
func UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product
	if err := config.DB.First(&product, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "商品不存在"})
		return
	}

	// 绑定新的数据
	var updateData struct {
		Title       string                `json:"title"`
		Description string                `json:"description"`
		Images      []models.ProductImage `json:"images"`
		Specs       []models.ProductSpec  `json:"specs"`
		Status      int                   `json:"status"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(400, gin.H{"error": "无效的请求参数"})
		return
	}

	// 开启事务
	tx := config.DB.Begin()

	// 更新基本信息
	product.Title = updateData.Title
	product.Description = updateData.Description
	product.Status = updateData.Status

	// 保存基本信息
	if err := tx.Save(&product).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "更新商品失败"})
		return
	}

	// 删除原有的图片
	if err := tx.Where("product_id = ?", id).Delete(&models.ProductImage{}).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "删除原有图片失败"})
		return
	}

	// 删除原有的规格
	if err := tx.Where("product_id = ?", id).Delete(&models.ProductSpec{}).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "删除原有规格失败"})
		return
	}

	// 保存新的图片，不使用传入的ID
	for _, image := range updateData.Images {
		newImage := models.ProductImage{
			ProductID: product.ID,
			URL:       image.URL,
			Sort:      image.Sort,
		}
		if err := tx.Create(&newImage).Error; err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": "保存图片失败"})
			return
		}
	}

	// 保存新的规格，不使用传入的ID
	for _, spec := range updateData.Specs {
		newSpec := models.ProductSpec{
			ProductID: product.ID,
			Name:      spec.Name,
			Value:     spec.Value,
			Sort:      spec.Sort,
		}
		if err := tx.Create(&newSpec).Error; err != nil {
			tx.Rollback()
			c.JSON(500, gin.H{"error": "保存规格失败"})
			return
		}
	}

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "保存数据失败"})
		return
	}

	// 重新加载完整的商品信息
	config.DB.Preload("Images").Preload("Specs").First(&product, id)

	c.JSON(200, product)
}

// DeleteProduct 删除商品
func DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Product{}, id).Error; err != nil {
		c.JSON(500, gin.H{"error": "删除商品失败"})
		return
	}
	c.JSON(200, gin.H{"message": "商品已删除"})
} 