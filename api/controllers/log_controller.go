package controllers

import (
	"github.com/gin-gonic/gin"
	"useradmin/api/config"
	"useradmin/api/models"
	"strconv"
)

// GetLogs 获取日志列表
func GetLogs(c *gin.Context) {
	// 获取查询参数
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")
	username := c.Query("username")
	action := c.Query("action")
	startTime := c.Query("start_time")
	endTime := c.Query("end_time")

	// 转换分页参数
	pageNum, _ := strconv.Atoi(page)
	limit, _ := strconv.Atoi(pageSize)
	offset := (pageNum - 1) * limit

	// 构建查询
	query := config.DB.Model(&models.Log{})

	// 添加搜索条件
	if username != "" {
		query = query.Where("username LIKE ?", "%"+username+"%")
	}
	if action != "" {
		query = query.Where("action = ?", action)
	}
	if startTime != "" {
		query = query.Where("created_at >= ?", startTime)
	}
	if endTime != "" {
		query = query.Where("created_at <= ?", endTime)
	}

	// 获取总数
	var total int64
	query.Count(&total)

	// 获取分页数据
	var logs []models.Log
	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&logs).Error; err != nil {
		c.JSON(500, gin.H{"error": "获取日志列表失败"})
		return
	}

	// 返回结果
	c.JSON(200, gin.H{
		"total": total,
		"page": pageNum,
		"page_size": limit,
		"data": logs,
	})
}

// GetLogTypes 获取日志类型列表
func GetLogTypes(c *gin.Context) {
	var types []string
	if err := config.DB.Model(&models.Log{}).Distinct().Pluck("action", &types).Error; err != nil {
		c.JSON(500, gin.H{"error": "获取日志类型失败"})
		return
	}
	c.JSON(200, types)
}

// GetLogStats 获取日志统计信息
func GetLogStats(c *gin.Context) {
	// 获取今日日志数
	var todayCount int64
	if err := config.DB.Model(&models.Log{}).Where("DATE(created_at) = CURDATE()").Count(&todayCount).Error; err != nil {
		c.JSON(500, gin.H{"error": "获取统计信息失败"})
		return
	}

	// 获取各类型日志数量
	type ActionCount struct {
		Action string `json:"action"`
		Count  int64  `json:"count"`
	}
	var actionCounts []ActionCount
	if err := config.DB.Model(&models.Log{}).
		Select("action, count(*) as count").
		Group("action").
		Find(&actionCounts).Error; err != nil {
		c.JSON(500, gin.H{"error": "获取统计信息失败"})
		return
	}

	c.JSON(200, gin.H{
		"today_count":    todayCount,
		"action_counts":  actionCounts,
	})
} 