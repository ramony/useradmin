package controllers

import (
	"fmt"
	"path/filepath"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"os"
)

// UploadImage 处理图片上传
func UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{"error": "获取上传文件失败"})
		return
	}

	// 生成唯一文件名
	ext := filepath.Ext(file.Filename)
	newFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	
	// 确保上传目录存在
	uploadDir := "uploads/images"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(500, gin.H{"error": "创建上传目录失败"})
		return
	}

	// 保存文件
	uploadPath := filepath.Join(uploadDir, newFileName)
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		c.JSON(500, gin.H{"error": "保存文件失败"})
		return
	}

	// 返回完整的URL
	baseURL := "http://localhost:8080"  // 根据实际情况修改
	fileURL := fmt.Sprintf("%s/uploads/images/%s", baseURL, newFileName)
	
	c.JSON(200, gin.H{
		"url": fileURL,
	})
} 