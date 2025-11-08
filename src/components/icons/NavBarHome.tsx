import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={48}
    height={48}
    fill="none"
    viewBox="0 0 48 48"
    {...props}
  >
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      d="M18 44V24h12v20M6 18 24 4l18 14v22a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V18Z"
    />
  </svg>
)
export default SvgComponent
