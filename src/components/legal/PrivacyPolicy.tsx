/**
 * 隐私政策内容组件
 *
 * 符合业界规范的隐私政策
 * 包含：信息收集、使用目的、数据安全、用户权利等
 */

import { FC } from "react";

interface PrivacyPolicyProps {
  className?: string;
}

export const PrivacyPolicy: FC<PrivacyPolicyProps> = ({ className = "" }) => {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        活动家平台隐私政策
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        更新日期：2025年1月1日 | 生效日期：2025年1月1日
      </p>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">引言</h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          活动家平台（以下简称"我们"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          请您在使用我们的服务前，仔细阅读并了解本隐私政策。
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          一、我们收集的信息
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          为向您提供服务，我们可能收集以下类型的信息：
        </p>

        <h4 className="text-base font-medium text-gray-700 mb-2">
          1.1 您主动提供的信息
        </h4>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-3 pl-4">
          <li>
            <strong>账号注册信息：</strong>手机号码、密码、用户名、头像
          </li>
          <li>
            <strong>个人资料信息：</strong>
            姓名、性别、年龄、职业、公司、个人简介、兴趣标签
          </li>
          <li>
            <strong>活动报名信息：</strong>
            根据活动要求填写的报名表单信息
          </li>
          <li>
            <strong>社交信息：</strong>微信二维码（可选）、联系方式
          </li>
        </ul>

        <h4 className="text-base font-medium text-gray-700 mb-2">
          1.2 自动收集的信息
        </h4>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-3 pl-4">
          <li>
            <strong>设备信息：</strong>设备型号、操作系统、唯一设备标识符
          </li>
          <li>
            <strong>日志信息：</strong>
            访问时间、浏览页面、搜索记录、IP地址
          </li>
          <li>
            <strong>位置信息：</strong>
            基于IP地址的大致位置（不收集精准定位）
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          二、信息使用目的
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          我们收集您的信息用于以下目的：
        </p>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-3 pl-4">
          <li>为您提供账号注册、登录及身份验证服务</li>
          <li>为您提供活动浏览、报名、匹配等核心功能</li>
          <li>为活动主办方提供智能匹配分组服务</li>
          <li>向您推送活动通知、系统消息</li>
          <li>改进和优化我们的产品与服务</li>
          <li>保障平台安全，防范风险</li>
          <li>履行法律法规规定的义务</li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          三、信息共享与披露
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          我们不会向第三方出售您的个人信息。在以下情况下，我们可能会共享您的信息：
        </p>

        <h4 className="text-base font-medium text-gray-700 mb-2">
          3.1 经您同意的共享
        </h4>
        <p className="text-gray-600 leading-relaxed mb-3">
          当您报名参加活动时，您的报名信息将与活动主办方共享，以便主办方进行活动管理和参与者匹配。
        </p>

        <h4 className="text-base font-medium text-gray-700 mb-2">
          3.2 与合作伙伴共享
        </h4>
        <p className="text-gray-600 leading-relaxed mb-3">
          我们可能与提供技术支持、数据分析等服务的合作伙伴共享必要信息，但我们会要求其遵守严格的保密义务。
        </p>

        <h4 className="text-base font-medium text-gray-700 mb-2">
          3.3 法律要求的披露
        </h4>
        <p className="text-gray-600 leading-relaxed mb-3">
          根据法律法规、政府要求或司法程序，我们可能需要披露您的信息。
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          四、信息存储与保护
        </h3>
        <h4 className="text-base font-medium text-gray-700 mb-2">
          4.1 存储地点
        </h4>
        <p className="text-gray-600 leading-relaxed mb-3">
          您的个人信息存储在中华人民共和国境内的服务器上。
        </p>

        <h4 className="text-base font-medium text-gray-700 mb-2">
          4.2 存储期限
        </h4>
        <p className="text-gray-600 leading-relaxed mb-3">
          我们仅在实现本政策所述目的所必需的期限内保留您的个人信息，除非法律要求或允许更长的保留期限。
        </p>

        <h4 className="text-base font-medium text-gray-700 mb-2">
          4.3 安全措施
        </h4>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-3 pl-4">
          <li>采用SSL/TLS加密传输数据</li>
          <li>对敏感信息进行加密存储</li>
          <li>严格限制数据访问权限</li>
          <li>定期进行安全审计和漏洞扫描</li>
          <li>建立数据安全应急响应机制</li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          五、您的权利
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          根据相关法律法规，您对您的个人信息享有以下权利：
        </p>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-3 pl-4">
          <li>
            <strong>访问权：</strong>
            您可以访问和查看您的个人信息
          </li>
          <li>
            <strong>更正权：</strong>
            您可以更正不准确或不完整的个人信息
          </li>
          <li>
            <strong>删除权：</strong>
            您可以申请删除您的个人信息（法律规定保留的除外）
          </li>
          <li>
            <strong>撤回同意权：</strong>
            您可以撤回此前给予的同意
          </li>
          <li>
            <strong>注销账号权：</strong>
            您可以申请注销账号
          </li>
        </ul>
        <p className="text-gray-600 leading-relaxed mb-3">
          如需行使上述权利，您可以通过平台设置页面操作，或联系我们的客服。
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          六、未成年人保护
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          我们的服务主要面向成年人。如果您是未满18周岁的未成年人，请在监护人的陪同下阅读本政策，并在取得监护人同意的前提下使用我们的服务。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          如果我们发现在未获得监护人同意的情况下收集了未成年人的个人信息，我们将尽快删除相关信息。
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          七、隐私政策更新
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          我们可能会不时更新本隐私政策。当发生重大变更时，我们会在平台上发布更新通知。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          您继续使用我们的服务即表示您同意更新后的隐私政策。
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          八、联系我们
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          如果您对本隐私政策有任何疑问、意见或建议，可以通过以下方式与我们联系：
        </p>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-3 pl-4">
          <li>通过平台内的客服功能</li>
          <li>发送邮件至 privacy@huodongjia.com</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mb-3">
          我们将在收到您的请求后15个工作日内予以回复。
        </p>
      </section>

      <p className="text-sm text-gray-500 mt-8 pt-4 border-t border-gray-200">
        感谢您信任并使用活动家平台。我们会持续努力保护您的个人信息安全。
      </p>
    </div>
  );
};

export default PrivacyPolicy;
