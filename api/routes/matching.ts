/**
 * 智能匹配相关API路由
 */
import { Router, type Request, type Response } from 'express'

const router = Router()

// Mock匹配规则数据
const mockMatchingRules = [
  {
    id: 'rule_001',
    name: '兴趣爱好匹配',
    description: '根据用户的兴趣爱好进行匹配，让有共同兴趣的人组成团队',
    weight: 40,
    enabled: true
  },
  {
    id: 'rule_002',
    name: '专业技能匹配',
    description: '基于专业技能和工作经验进行匹配，促进技能互补',
    weight: 35,
    enabled: true
  },
  {
    id: 'rule_003',
    name: '地域分布平衡',
    description: '平衡各组的地域分布，促进不同地区的交流',
    weight: 15,
    enabled: true
  },
  {
    id: 'rule_004',
    name: '性别比例平衡',
    description: '保持各组性别比例的相对平衡',
    weight: 10,
    enabled: false
  }
]

// Mock参与者关键词数据
const mockParticipantKeywords = [
  {
    user_id: 'user_001',
    keywords: ['前端开发', 'React', 'JavaScript', '用户体验', '产品设计'],
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5] // Mock词向量
  },
  {
    user_id: 'user_002',
    keywords: ['产品管理', '用户研究', '数据分析', 'Figma', '项目管理'],
    embedding: [0.2, 0.3, 0.1, 0.5, 0.4] // Mock词向量
  }
]

// Mock匹配结果
const mockMatchingGroups = [
  {
    group_id: 'group_001',
    members: [
      {
        user_id: 'user_001',
        name: '王小明',
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20young%20man&image_size=square',
        keywords: ['前端开发', 'React'],
        profile: {
          age: 28,
          occupation: '前端工程师',
          company: '科技公司A'
        }
      },
      {
        user_id: 'user_002',
        name: '李小红',
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20young%20woman&image_size=square',
        keywords: ['产品设计', '用户体验'],
        profile: {
          age: 26,
          occupation: '产品经理',
          company: '科技公司B'
        }
      }
    ],
    similarity_score: 0.85,
    match_reasons: ['技术背景相似', '都关注用户体验', '年龄相近'],
    is_locked: false
  }
]

/**
 * 提取匹配规则API
 * GET /api/generate-match-rules/:activity_id
 */
router.get('/generate-match-rules/:activity_id', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未授权访问',
        rules: []
      })
      return
    }

    const { activity_id } = req.params
    
    // Mock生成匹配规则
    res.status(200).json({
      success: true,
      message: '匹配规则生成成功',
      rules: mockMatchingRules
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      rules: []
    })
  }
})

/**
 * 基于自然语言生成匹配规则
 * POST /api/generate-match-rules/:activity_id
 */
router.post('/generate-match-rules/:activity_id', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未授权访问',
        rules: []
      })
      return
    }

    const { activity_id } = req.params
    const { description } = req.body
    
    if (!description) {
      res.status(400).json({
        success: false,
        message: '匹配需求描述不能为空',
        rules: []
      })
      return
    }

    // Mock基于自然语言生成规则
    let generatedRules = [...mockMatchingRules]
    
    // 根据描述调整规则权重
    if (description.includes('兴趣') || description.includes('爱好')) {
      generatedRules[0].weight = 50
      generatedRules[1].weight = 30
    }
    
    if (description.includes('技能') || description.includes('专业')) {
      generatedRules[1].weight = 50
      generatedRules[0].weight = 30
    }
    
    if (description.includes('平衡') || description.includes('性别') || description.includes('年龄')) {
      generatedRules[3].enabled = true
      generatedRules[3].weight = 20
    }

    res.status(200).json({
      success: true,
      message: '基于自然语言的匹配规则生成成功',
      rules: generatedRules
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      rules: []
    })
  }
})

/**
 * 提取关键词并做词嵌入API
 * GET /api/do-match/:activity_id
 */
router.get('/do-match/:activity_id', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未授权访问',
        keywords: []
      })
      return
    }

    const { activity_id } = req.params
    
    // Mock提取关键词和词嵌入
    res.status(200).json({
      success: true,
      message: '关键词提取和词嵌入完成',
      keywords: mockParticipantKeywords
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      keywords: []
    })
  }
})

/**
 * 执行匹配API
 * POST /api/do-match/:activity_id
 */
router.post('/do-match/:activity_id', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未授权访问',
        groups: []
      })
      return
    }

    const { activity_id } = req.params
    const { rules, similarity_matrix } = req.body
    
    // Mock执行匹配
    res.status(200).json({
      success: true,
      message: '匹配执行成功',
      groups: mockMatchingGroups
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      groups: []
    })
  }
})

/**
 * 提取用户关键词条API
 * GET /api/extract-keywords/:activity_id
 */
router.get('/extract-keywords/:activity_id', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未授权访问',
        keywords: []
      })
      return
    }

    const { activity_id } = req.params
    
    // Mock提取用户关键词
    res.status(200).json({
      success: true,
      message: '用户关键词提取成功',
      keywords: mockParticipantKeywords.map(p => ({
        user_id: p.user_id,
        keywords: p.keywords
      }))
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      keywords: []
    })
  }
})

/**
 * 获取词向量API (内部AI服务)
 * POST /api/get_embedding
 */
router.post('/get_embedding', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body
    
    if (!text) {
      res.status(400).json({
        success: false,
        message: '文本内容不能为空',
        embedding: []
      })
      return
    }

    // Mock生成词向量
    const mockEmbedding = Array.from({ length: 128 }, () => Math.random() * 2 - 1)
    
    res.status(200).json({
      success: true,
      message: '词向量获取成功',
      embedding: mockEmbedding
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      embedding: []
    })
  }
})

/**
 * 计算词嵌入并保存到数据库API
 * GET /api/get-embedding/:activity_id
 */
router.get('/get-embedding/:activity_id', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未授权访问',
        embeddings: []
      })
      return
    }

    const { activity_id } = req.params
    
    // Mock计算并保存词嵌入
    res.status(200).json({
      success: true,
      message: '词嵌入计算并保存成功',
      embeddings: mockParticipantKeywords
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      embeddings: []
    })
  }
})

/**
 * 计算余弦相似度API
 * GET /api/calculate-similarity/:activity_id
 */
router.get('/calculate-similarity/:activity_id', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未授权访问',
        similarity_matrix: []
      })
      return
    }

    const { activity_id } = req.params
    
    // Mock计算余弦相似度矩阵
    const mockSimilarityMatrix = [
      [1.0, 0.85, 0.72, 0.63],
      [0.85, 1.0, 0.78, 0.69],
      [0.72, 0.78, 1.0, 0.81],
      [0.63, 0.69, 0.81, 1.0]
    ]
    
    res.status(200).json({
      success: true,
      message: '余弦相似度计算成功',
      similarity_matrix: mockSimilarityMatrix
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      similarity_matrix: []
    })
  }
})

export default router