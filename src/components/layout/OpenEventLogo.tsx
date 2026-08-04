import type { FC } from "react";
import openeventLogo from "@/assets/auth/login/openevent-logo.svg";

interface OpenEventLogoProps {
  className?: string;
  decorative?: boolean;
}

/** OpenEvent 品牌图形，复用登录页 Figma `221:3492` 对应 SVG。 */
export const OpenEventLogo: FC<OpenEventLogoProps> = ({
  className,
  decorative = false,
}) => (
  <img
    src={openeventLogo}
    alt={decorative ? "" : "OpenEvent"}
    aria-hidden={decorative || undefined}
    className={className}
  />
);

export default OpenEventLogo;
