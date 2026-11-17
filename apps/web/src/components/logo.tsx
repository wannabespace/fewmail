import { cn } from '@fewmail/ui/lib/utils'
import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import type { Transition } from 'motion/react'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'

// Outlined from brand/logo: Baloo 2 is not loaded in the app.
const SMILING_BIRD =
  'M14 54C14 34 30 22 48 22C70 22 84 38 84 54L94 58L82 64C76 78 64 84 50 84C30 84 14 72 14 54ZM25.9 56.1Q24 54.1 22.1 56.1Q21.1 57 21.1 58Q21.1 59 22.1 59.9Q31.4 69.3 46.8 70.2Q61.3 71.1 71.5 64.3Q72.7 63.5 72.9 62.6Q73 61.6 72.3 60.5Q70.8 58.2 68.5 59.7Q59.8 65.5 47.2 64.8Q33.9 64 25.9 56.1Z'
const SLEEPING_BIRD =
  'M14 54C14 34 30 22 48 22C70 22 84 38 84 54L94 58L82 64C76 78 64 84 50 84C30 84 14 72 14 54ZM56.8 43.9Q54.7 42.1 52.9 44.2Q51.1 46.3 53.2 48.1Q62 55.6 70.8 48.1Q72.9 46.3 71.1 44.2Q70.2 43.2 69.2 43.1Q68.2 43 67.2 43.9Q62 48.4 56.8 43.9Z'
const BIG_Z =
  'M77.1 23.1Q76.9 22.6 76.9 22Q76.9 21.5 77.1 21Q77.4 20.5 77.7 20.1L82.2 14.8H77.4Q77.3 14.5 77.1 14.1Q77 13.6 77 13.1Q77 12.2 77.4 11.8Q77.8 11.4 78.5 11.4H86.7Q87.1 11.8 87.3 12.2Q87.6 12.7 87.6 13.4Q87.6 13.9 87.3 14.4Q87.1 14.9 86.7 15.3L82.4 20.6H87.4Q87.6 20.9 87.7 21.3Q87.9 21.8 87.9 22.3Q87.9 23.2 87.5 23.6Q87.1 24 86.4 24H77.8Q77.4 23.6 77.1 23.1Z'
const SMALL_Z =
  'M93.1 9H92.2Q91.9 8.8 91.7 8.4Q91.6 8.1 91.6 7.7Q91.6 7.4 91.7 7Q91.9 6.7 92.1 6.4L95.1 3H91.9Q91.8 2.8 91.7 2.5Q91.7 2.2 91.7 1.9Q91.7 1.3 91.9 1Q92.2 0.8 92.6 0.8H98Q98.2 1 98.4 1.3Q98.6 1.6 98.6 2Q98.6 2.4 98.4 2.7Q98.2 3 98 3.3L95.2 6.8H98.5Q98.6 6.9 98.7 7.2Q98.8 7.5 98.8 7.9Q98.8 8.5 98.5 8.7Q98.2 9 97.8 9H93.1Z'
const WORDMARK =
  'M219.6 -33.4V-0.1Q218.5 0.2 216.4 0.5Q214.4 0.8 212 0.8Q207.1 0.8 204.8 -0.9Q202.6 -2.6 202.6 -7.2V-31.1Q202.6 -34.1 200.8 -35.5Q199.1 -36.8 196.6 -36.8Q194.7 -36.8 193.3 -36.2Q191.9 -35.7 191 -35.2V-0.1Q189.9 0.2 187.8 0.5Q185.8 0.8 183.4 0.8Q178.5 0.8 176.2 -0.9Q174 -2.6 174 -7.2V-37.3Q174 -40 175.2 -41.7Q176.3 -43.4 178.3 -44.8Q181.7 -47.2 186.8 -48.6Q191.8 -50.1 197.3 -50.1Q202 -50.1 206.3 -48.6Q209.5 -47.6 212.2 -45.5Q214.7 -47 217.4 -48.2Q221.7 -50.1 228 -50.1Q233.1 -50.1 237.8 -48.3Q242.4 -46.5 245.3 -42.5Q248.2 -38.4 248.2 -31.6V-0.1Q247.1 0.2 245.1 0.5Q243 0.8 240.6 0.8Q235.7 0.8 233.4 -0.9Q231.2 -2.6 231.2 -7.2V-31.1Q231.2 -34.1 229.6 -35.5Q228 -36.8 225.4 -36.8Q223.5 -36.8 221.8 -36Q220.5 -35.5 219.5 -34.8Q219.6 -34.1 219.6 -33.4ZM131.7 -27.3Q130.8 -22.7 129.3 -17.7Q127.9 -12.7 126.6 -8.4Q125.3 -4.1 124.6 -1.7Q123.3 -0.5 120.8 0.2Q118.4 1 115.1 1Q111.1 1 108 -0.1Q105 -1.3 104 -3.4Q103.1 -5.4 102 -9.1Q100.9 -12.7 99.8 -17.4Q98.6 -22.2 97.5 -27.4Q96.4 -32.5 95.5 -37.4Q94.6 -42.2 94 -46.1Q95.4 -47.5 97.8 -48.5Q100.1 -49.6 102.9 -49.6Q106.4 -49.6 108.7 -48Q110.9 -46.5 111.4 -42.7Q112.4 -35.1 113.1 -30.1Q113.8 -25.1 114.2 -22.1Q114.7 -19 115 -17.3Q115.2 -15.6 115.4 -14.6H115.8Q116.3 -16.8 117.4 -21.4Q118.5 -25.9 120 -31.8Q121.5 -37.7 122.9 -43.7Q124.9 -44.8 126.9 -45.4Q128.9 -46 131.7 -46Q135.2 -46 137.7 -44.9Q140.2 -43.8 140.9 -41.5Q142.5 -35.7 143.9 -30.3Q145.3 -24.9 146.3 -20.8Q147.4 -16.7 147.8 -14.6H148.3Q149.4 -22.3 150.4 -30.6Q151.5 -39 152.4 -47.5Q156 -49.6 160.2 -49.6Q163.7 -49.6 166 -48.1Q168.3 -46.6 168.3 -42.9Q168.3 -41.3 167.8 -38.1Q167.3 -35 166.5 -31Q165.7 -27 164.7 -22.6Q163.6 -18.2 162.6 -14.1Q161.5 -10 160.6 -6.8Q159.6 -3.5 158.9 -1.7Q157.6 -0.5 154.7 0.2Q151.7 1 148.4 1Q140 1 138.5 -3.2Q137.7 -5.6 136.4 -9.6Q135.1 -13.5 133.8 -18.2Q132.6 -22.9 131.7 -27.3ZM276.7 -50.1Q287.6 -50.1 294.1 -45.6Q300.7 -41.2 300.7 -31.8V-9.4Q300.7 -6.8 299.2 -5.2Q297.8 -3.5 295.8 -2.3Q292.6 -0.4 288 0.6Q283.4 1.6 277.5 1.6Q267 1.6 260.6 -2.5Q254.3 -6.5 254.3 -14.7Q254.3 -21.6 258.4 -25.3Q262.6 -29 271.1 -29.9L284.2 -31.3V-32Q284.2 -34.9 281.6 -36.1Q279.1 -37.4 274.3 -37.4Q270.6 -37.4 266.9 -36.6Q263.3 -35.8 260.4 -34.6Q259.1 -35.5 258.2 -37.4Q257.3 -39.2 257.3 -41.2Q257.3 -46 262.4 -48Q265.3 -49.1 269.2 -49.6Q273.2 -50.1 276.7 -50.1ZM58.7 -17.7Q59.9 -14.4 62.8 -12.9Q66.3 -11.1 70.7 -11.1Q74.9 -11.1 78.7 -12.2Q82.5 -13.3 84.8 -14.6Q86.4 -13.6 87.5 -11.8Q88.6 -10 88.6 -8Q88.6 -4.7 86.2 -2.5Q83.7 -0.4 79.4 0.6Q75.1 1.6 69.5 1.6Q61.7 1.6 55.5 -1.4Q49.2 -4.3 45.5 -10.2Q41.9 -16.1 41.9 -25Q41.9 -31.6 44 -36.4Q46.2 -41.2 49.8 -44.2Q53.4 -47.2 57.9 -48.6Q62.3 -50.1 67 -50.1Q74.1 -50.1 79.4 -47.4Q84.7 -44.6 87.7 -39.9Q90.7 -35.1 90.7 -28.9Q90.7 -25.5 88.8 -23.7Q86.9 -21.9 83.5 -21.4ZM21.5 -48V-44.8H37.9Q38.5 -43.8 39 -42.1Q39.6 -40.4 39.6 -38.4Q39.6 -34.9 38 -33.4Q36.5 -31.8 33.9 -31.8H22.4V-0.1Q21.3 0.2 19.2 0.5Q17.2 0.8 14.8 0.8Q9.9 0.8 7.7 -0.9Q5.4 -2.6 5.4 -7.2V-48.6Q5.4 -55.4 8.4 -59.6Q11.4 -63.9 16.4 -65.9Q21.5 -67.9 27.6 -67.9Q35 -67.9 38.5 -66Q42 -64 42 -59.3Q42 -57.3 41.1 -55.7Q40.3 -54.1 39.3 -53.3Q37.4 -53.8 35.4 -54.1Q33.3 -54.5 30.6 -54.5Q26.3 -54.5 23.9 -53Q21.5 -51.6 21.5 -48ZM352.8 -17.5V-0.1Q351.7 0.2 349.6 0.5Q347.6 0.8 345.2 0.8Q340.3 0.8 338.1 -0.9Q335.8 -2.6 335.8 -7.2V-65.2Q336.9 -65.5 338.9 -65.8Q341 -66.1 343.4 -66.1Q348.4 -66.1 350.6 -64.5Q352.8 -62.8 352.8 -58.1V-17.5ZM309.5 -47.9Q310.6 -48.2 312.6 -48.5Q314.7 -48.8 317.1 -48.8Q322.1 -48.8 324.3 -47.1Q326.5 -45.5 326.5 -40.8V-0.1Q325.4 0.2 323.4 0.5Q321.3 0.8 318.9 0.8Q314 0.8 311.8 -0.9Q309.5 -2.6 309.5 -7.2V-47.9ZM308.7 -62.1Q308.7 -65.9 311.3 -68.5Q313.9 -71.1 318 -71.1Q322.1 -71.1 324.7 -68.5Q327.3 -65.9 327.3 -62.1Q327.3 -58.4 324.7 -55.8Q322.1 -53.1 318 -53.1Q313.9 -53.1 311.3 -55.8Q308.7 -58.4 308.7 -62.1ZM277.5 -10.8Q279.2 -10.8 281.2 -11.2Q283.3 -11.5 284.3 -12.1V-20.1L277.1 -19.5Q274.3 -19.3 272.5 -18.3Q270.7 -17.3 270.7 -15.3Q270.7 -13.3 272.2 -12.1Q273.8 -10.8 277.5 -10.8ZM57.7 -28.9 74.7 -31.7Q74.5 -33.7 72.7 -35.7Q70.9 -37.7 67.1 -37.7Q63.1 -37.7 60.5 -35.1Q58.1 -32.8 57.7 -28.9Z'

const BLINK = { duration: 0.2, ease: [0.32, 0.72, 0, 1] } as const
const EYE = {
  happy: { opacity: 0, scaleY: 0.2 },
  rest: { opacity: 1, scaleY: 1 },
}
const HAPPY_EYE = {
  happy: { opacity: 1, pathLength: 1 },
  rest: { opacity: 0, pathLength: 0 },
}

// The eye is a hole in the bird: it animates inside the mask, where black cuts and white keeps.
export const LogoMark = ({
  className,
  isHappy = false,
}: {
  className?: string
  isHappy?: boolean
}) => {
  const maskId = useId()
  const transition = useReducedMotion() ? { duration: 0 } : BLINK
  return (
    <motion.svg
      viewBox="12 11 84 84"
      aria-hidden="true"
      initial={false}
      animate={isHappy ? 'happy' : 'rest'}
      className={cn('text-primary size-5.5 shrink-0', className)}
    >
      <mask id={maskId}>
        {/* oxlint-disable-next-line shadcn/no-raw-colors -- mask luminance, not a colour */}
        <rect x="12" y="11" width="84" height="84" fill="white" />
        <motion.circle
          cx="62"
          cy="44"
          r="6.5"
          fill="black"
          variants={EYE}
          transition={transition}
        />
        <motion.path
          d="M55 47Q62 37 69 47"
          fill="none"
          stroke="black"
          strokeWidth="5.5"
          strokeLinecap="round"
          variants={HAPPY_EYE}
          transition={transition}
        />
      </mask>
      <path d={SMILING_BIRD} fill="currentColor" mask={`url(#${maskId})`} />
    </motion.svg>
  )
}

const BREATH: Transition = {
  duration: 2,
  ease: 'easeInOut',
  repeat: Infinity,
  repeatType: 'mirror',
}
const SNORE: Transition = {
  duration: 2.8,
  ease: 'easeOut',
  repeat: Infinity,
  repeatDelay: 1.2,
  times: [0, 0.3, 1],
}

// The z's drift up past the top of the viewBox, so the svg must not clip.
export const SleepingLogoMark = ({ className }: { className?: string }) => {
  const isStill = useReducedMotion()
  return (
    <svg
      viewBox="13 -1.01 86.77 86.77"
      aria-hidden="true"
      className={cn('overflow-visible', className)}
    >
      <motion.path
        d={SLEEPING_BIRD}
        fill="currentColor"
        initial={{ originY: 1 }}
        animate={isStill ? undefined : { scaleX: 0.985, scaleY: 1.04 }}
        transition={BREATH}
      />
      {[BIG_Z, SMALL_Z].map((d, index) => (
        <motion.path
          key={d}
          d={d}
          fill="currentColor"
          initial={isStill ? false : { opacity: 0 }}
          animate={
            isStill
              ? undefined
              : { opacity: [0, 1, 0], x: [0, 1, 4], y: [4, 0, -6] }
          }
          transition={{ ...SNORE, delay: index * 0.6 }}
        />
      ))}
    </svg>
  )
}

export const Logo = ({ to = '/' }: { to?: LinkProps['to'] }) => {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <Link
      to={to}
      aria-label="Fewmail"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className="text-primary focus-visible:focus-ring flex w-fit items-center gap-1.5 rounded-md outline-none"
    >
      <LogoMark isHappy={isHovered} />
      <svg
        viewBox="4.4 -72.1 349.4 74.7"
        aria-hidden="true"
        className="h-3.75 w-auto"
      >
        <path d={WORDMARK} fill="currentColor" />
      </svg>
    </Link>
  )
}
