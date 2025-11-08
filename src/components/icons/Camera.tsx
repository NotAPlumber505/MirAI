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
      d="M46 38a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4h8l4-6h12l4 6h8a4 4 0 0 1 4 4v22Z"
    />
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      d="M24 34a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
    />
  </svg>
)
export default SvgComponent
