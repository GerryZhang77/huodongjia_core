/**
 * 头像工具函数
 * 提供默认头像生成功能
 */

/**
 * 生成默认头像 URL
 * 随机使用 avataaars（卡通人物）或 fun-emoji（可爱表情）风格
 *
 * @param seed - 用于生成头像的种子（通常是用户ID或名字）
 * @param size - 头像尺寸（可选，默认不指定）
 * @returns 头像 URL
 */
export function generateDefaultAvatar(seed: string, size?: number): string {
  // 使用种子的哈希值来决定使用哪种风格，确保同一个用户总是得到相同的风格
  const hash = seed.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // 根据哈希值的奇偶性选择风格
  const style = Math.abs(hash) % 2 === 0 ? 'avataaars' : 'fun-emoji';

  const sizeParam = size ? `&size=${size}` : '';
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}${sizeParam}`;
}

/**
 * 获取用户头像 URL
 * 如果用户有自定义头像则使用，否则生成默认头像
 *
 * @param avatar - 用户的头像 URL（可能为空）
 * @param fallbackSeed - 当没有头像时用于生成默认头像的种子
 * @param size - 头像尺寸（可选）
 * @returns 头像 URL
 */
export function getUserAvatar(avatar: string | undefined | null, fallbackSeed: string, size?: number): string {
  if (avatar && avatar.trim()) {
    return avatar;
  }
  return generateDefaultAvatar(fallbackSeed, size);
}
