/**
 * Returns contiguous array of inclusive integers
 * range(0, 2) => [0, 1, 2]
 * range(3, 1) => [3, 2, 1]
 * range(4, 4) => [4]
 */
const range = (start, end) => end > start
  ? [...Array((end + 1) - start).keys()].map(x => x + start)
  : [...Array((start + 1) - end).keys()].map(x => x + end).reverse()

export default range
