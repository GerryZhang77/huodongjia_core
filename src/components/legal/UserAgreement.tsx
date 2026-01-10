/**
 * 用户协议内容组件
 *
 * 符合业界规范的用户服务协议
 * 包含：服务条款、用户行为规范、免责声明、知识产权等
 */

import { FC } from "react";

interface UserAgreementProps {
  className?: string;
}

export const UserAgreement: FC<UserAgreementProps> = ({ className = "" }) => {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        活动家平台用户服务协议
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        更新日期：2025年1月1日 | 生效日期：2025年1月1日
      </p>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">一、总则</h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          1.1
          欢迎您使用活动家平台（以下简称"本平台"）。本协议是您与活动家平台运营方之间关于使用本平台服务的法律协议。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          1.2
          在使用本平台服务之前，请您仔细阅读并充分理解本协议的全部内容。当您注册成为本平台用户、使用本平台服务时，即表示您已阅读、理解并同意接受本协议的全部条款。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          1.3
          本平台有权根据国家法律法规的更新、产品和服务规则的调整需要，对本协议进行修改更新，并以平台公告的方式予以公布，无需另行单独通知您。
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          二、账号注册与管理
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          2.1
          您在注册账号时应提供真实、准确、完整的个人信息，并在信息发生变更时及时更新。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          2.2
          您应妥善保管账号和密码信息，因您个人原因导致的账号信息泄露所造成的损失由您自行承担。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          2.3
          您不得将账号转让、出借、出租给他人使用，不得通过任何方式授权他人使用您的账号。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          2.4
          如发现任何未经授权使用您账号的情况，您应立即通知本平台。本平台有权采取冻结账号等措施。
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          三、平台服务
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          3.1 本平台为用户提供活动发布、活动报名、智能匹配、社交互动等相关服务。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          3.2
          商家用户（活动主办方）可以通过本平台发布活动信息、管理报名、进行参与者匹配分组等。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          3.3
          普通用户（活动参与者）可以通过本平台浏览活动、报名参与、查看匹配结果、与其他参与者互动等。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          3.4
          本平台保留随时修改、中断或终止部分或全部服务的权利，且无需对用户或任何第三方承担责任。
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          四、用户行为规范
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          4.1 您在使用本平台服务时，应遵守中华人民共和国相关法律法规。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          4.2 您不得利用本平台从事以下行为：
        </p>
        <ul className="list-disc list-inside text-gray-600 leading-relaxed mb-3 pl-4">
          <li>发布虚假、欺诈性活动信息</li>
          <li>发布违法、淫秽、暴力等不当内容</li>
          <li>侵犯他人知识产权、隐私权等合法权益</li>
          <li>传播垃圾信息、恶意软件或病毒</li>
          <li>干扰或破坏本平台的正常运行</li>
          <li>进行任何形式的网络攻击或数据窃取</li>
          <li>其他违反法律法规或本协议的行为</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mb-3">
          4.3
          如您违反上述规定，本平台有权采取警告、限制功能、暂停服务、永久封禁等措施，并保留追究法律责任的权利。
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          五、知识产权
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          5.1
          本平台的标识、界面设计、文字、图片、视频、软件等内容的知识产权均归本平台所有，受中国法律保护。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          5.2
          未经本平台书面许可，任何人不得擅自使用、复制、修改、传播本平台的上述内容。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          5.3
          您在本平台发布的内容，授予本平台非独占、免费、可转让的全球许可，允许本平台使用、复制、修改、展示该内容。
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          六、免责声明
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          6.1
          本平台仅为活动主办方和参与者提供信息发布和匹配服务，不对活动本身的质量、安全性、合法性承担责任。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          6.2
          因不可抗力（包括但不限于自然灾害、政府行为、网络故障等）导致服务中断或数据丢失，本平台不承担责任。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          6.3 本平台的智能匹配结果仅供参考，不构成任何形式的承诺或保证。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          6.4
          用户之间因活动参与产生的任何纠纷，由用户自行协商解决，本平台不承担连带责任。
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          七、争议解决
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          7.1
          本协议的签订、履行、解释及争议解决均适用中华人民共和国法律（不包括香港、澳门、台湾地区法律）。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          7.2
          因本协议引起的或与本协议有关的争议，双方应友好协商解决；协商不成的，任何一方均可向本平台运营方所在地人民法院提起诉讼。
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          八、其他条款
        </h3>
        <p className="text-gray-600 leading-relaxed mb-3">
          8.1 本协议的任何条款如被认定为无效或不可执行，不影响其他条款的效力。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          8.2
          本平台未能行使或执行本协议任何权利或条款，不构成对该权利或条款的放弃。
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          8.3 如您对本协议有任何疑问，可通过本平台客服渠道与我们联系。
        </p>
      </section>

      <p className="text-sm text-gray-500 mt-8 pt-4 border-t border-gray-200">
        活动家平台运营方保留对本协议的最终解释权。
      </p>
    </div>
  );
};

export default UserAgreement;
