import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={49}
    height={50}
    fill="none"
    viewBox="0 0 49 50"
    {...props}
  >
    <path fill="url(#a)" d="M0 0h48.729v50H0z" />
    <defs>
      <pattern
        id="a"
        width={1}
        height={1}
        patternContentUnits="objectBoundingBox"
      >
        <use xlinkHref="#b" transform="matrix(.02 0 0 .0195 0 .013)" />
      </pattern>
      <image
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADSklEQVR4nO2ZTUgVURiGx8LUfhGKSKQWRSFBVBIJQbVTJBKjW/RHFPTjokW1KIIiDGphLlrUIqg2VsvMkEooqUXYSsJqEYEFKgSWizIyLz1x6tw4d5g5c878XC80L8zG+b73+557zsycc3ScVKlS/d8CtgM/gY/AU6AVWFmg2vOAk0AvMAp0RDHbjLc6gcWxdp5ftxYYcdVsi2K4FH99AlYnNBIjHvWaopiWAJ81MB+ASkOvu8AV4KhuNIETHnVED7NCg0jjW+h10dBnzJX3XEwhj7hejxoHI0FI43XALw2IeBBLDXz6PXJ/AFtdcaOukYgOoZjfCBiVjQYebT65X4FqJe62jG0CZsYGIc0rgCcakDMGHhs0+e2xNqyTmD7AeeCbRyMDhh49mpdGiU/OKqAFuCxHq86klkkzlcBhoNvVTI1B7kLgnQ/MJiVuGrAPeOsR1xALiFKsXM7vnI5Z/BDXPEb2urw/G+jSTMP4VxbAI6XAHde9GmCL+iC77ouGb7qmlxiJ+xoI8ZYrTwJEPDM5vQbKgHNybZZToyZ/vatRsZbTqSd2CNnILqWIWFw+8yi+IuAFMq7E6r5XQruTAqkLKDxo4PECM70CpicFsiSguMn3pcMAYkw3snGAzNcUF/uXGQYeFwIg+oFliUEoX3y3BsVImEBIj+MeHuPAY2BHYtPJY5mv6kgIj0NK/ndguckiNHa5QDIh8vco+ZPJdFkYkIxq4CTQoPi4NcpCussXBKgCtgXkt+tA+Lt/V+NFT2U2IA+x1z8QsTQBvtgaOPk9HPAJ67YByUYEaQiR7wbx29BlbUCICFIhV7FWP4iT38Ma4H1QXCwPsWlc1IedsC8FC5BJJa45BEizyeuXAoA8UE48FoUAqVJeCl1TCSJ2ivV+GyjDWtXSw3fTlDhIoURcIGLxBuwE3ojTRb+jUrlZEqf4azXetTKmVLOvvyRr/Vk4xgUijjeHPfbP94CzwF55ZHMVGFJi+uT2db+8WuXfchqSOS3SQ3h1Sm9Vw7KHyCBFJ8cCZILi1YQNiJifxaoBG5DTFK9O2YCI78NLik991od0wFz5j54wK+G4lZUnk3OsIFxAC+SyPDNFV704sQkNkCpVqlROMeo3QaSvQnzFFjgAAAAASUVORK5CYII="
        id="b"
        width={50}
        height={50}
        preserveAspectRatio="none"
      />
    </defs>
  </svg>
)
export default SvgComponent
