import type { ColorMatcher, MatcherRegistry } from "@/domain/pattern/pattern-generator"

export function createMatcherRegistry(matchers: ColorMatcher[]): MatcherRegistry {
  const map = new Map(matchers.map((matcher) => [matcher.id, matcher]))

  return {
    getMatcher(matcherId: string) {
      const matcher = map.get(matcherId)

      if (!matcher) {
        throw new Error(`Matcher not found: ${matcherId}`)
      }

      return matcher
    },
  }
}
