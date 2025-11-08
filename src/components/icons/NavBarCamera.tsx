import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={58}
    height={52}
    fill="none"
    viewBox="0 0 58 52"
    {...props}
  >
    <path fill="url(#a)" d="M0 0h57.261v52H0z" />
    <defs>
      <pattern
        id="a"
        width={1}
        height={1}
        patternContentUnits="objectBoundingBox"
      >
        <use xlinkHref="#b" transform="matrix(.00908 0 0 .01 .046 0)" />
      </pattern>
      <image
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEqElEQVR4nO2dy48VRRhHmwgb8O0C1IgYEVE0USIDRo1GidG40J342qj8AYMLt0Q2s0GNG9GgmDFiZvD9JGpcqguCwaAS3chrAaIRI8bHDcdUpkiuRfXt6kvf7qLqd5LezO2vpqpO+v1VVVEIIYQQQgghhBBCCJExwBnAKuBBYBx4MpFt3LZppWljETvANcAW4Ajp8zPwMrCsiA3gfFu5HvnRAzYD5xYxACwGvu+6VyLgR+CqrmUsBX7tuici4hdgSZenqR+67oEI2QOc14UQc/EWfl5sW8a1mV7AQ+m1evdV4+g4DuwFdiSy7bVtCuGltmTMDnzOeB24tEgMYBEwFdD+w608PAI3BsqYVSQKMCtQyso2KvNARSXMIb2wSBxmjpSq09eaNiryREUlfioygZlryiDWtVGJ9RWV2F1kArC7oi/Wt1EJCbFISGRISGRISGRISGRISGRISGRkKwS4HngemB5yM7HXjaBe+QkB5gO/c+qYMuY3XLd0hQD3ARPATc7fN9AcGxrriJSFAA87H3eW27/PbTilyJQ1t8G+SEsIsABYaz/+9POBTUybpHkmByTCPV7ntJaUEOAR4Bjx8QfwUFZCbCpmzN/k/wVW5CTkNeLn1ZyEfN1Qpx0DdgEfAh8B3wB/1og3SX4fAwc8v+3MSUhVQ6rYDtzru2Oyd2bmFvqTijKMhAU2Zh7w1QjakbyQA8DqGnW9EzhYUtYzzr5rR9COpIXsBC4aor4X21iXd539JkbQjmSF7DtxevGUNQe4xG5zSva5ENjvKXfCpjWtA/6SkHBu9pRxmc2gPNq331E7TmWRZ/9ba/5PCSnhLU/8akeEy2/AHZ64dwhHQkq4zYldEvj21whb7MTeTjgSUvIycLYTu41wpjx5yWZQTQgS4uEzJ+4sz8V3EGbfM50yPg+MlRAPk07ccurzvy+F5pVIYJyEeNjixK2gPjc4ZbwSGCchHrY7cRfUfEvcc8f7BbxSOYGEeNjvjjMx1xXC+dQzrqPsVYqLhASeclbZ7xVV/AOMObFjhCMhJbzgiX+sQor57VFPnJlxIRQJGdC5J82QANwCfOnZ/4uSVy3Lal5/JGQA5oPWvJKyFgJ32c07lM48i9gPWXWQkAreGyaFx36wep/6SEgAJl3o8poT4/i+hYQgIYH8DTw7aJIX4ErgObvvsGQlpO75vAwzLdRW4Gm7bbWTvzTBrpyEvE38vJmTkHuIn7uzEWLLeYo4OR7akUkJ6Usp3XgKA3GmG942uq9bshJyuoOExIWERIaERIaERIaERIaERIaEREYsQjTFn8Vm5Xc+xV/IJJgnZZ+nBjPZ91WTYN7fRkVM1kcVUxlME7stoB/G2lo9xyxmUsV0ikcKM0fGGwHtP9TaKjx2UEwo+yKYInxHQ1vVNaOfza3I6Fs3JCRZLVd6wNWtCRki6Sw3NrUqwwo5G/i265ZHyJ7O1qOyw8tCRyTlwBHgik5kOLlP33XdExFgln9aWsSAOUTNMj+Rz/AzKszNzSbgnCI2zJ2FWVnGLmaSOoftjU23S+XVeHg0CQxr7HKlE4ls47ZNY6fF0qtCCCGEEEIIIYQQQhSj4z9ZztURz7I3eAAAAABJRU5ErkJggg=="
        id="b"
        width={100}
        height={100}
        preserveAspectRatio="none"
      />
    </defs>
  </svg>
)
export default SvgComponent
