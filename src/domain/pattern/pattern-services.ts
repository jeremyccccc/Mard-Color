import { imageCropper } from "@/domain/image/image-crop"
import { averageGridSampler } from "@/domain/image/image-sampler"
import { ciede2000Matcher } from "@/domain/matcher/match-by-ciede2000"
import { createMatcherRegistry } from "@/domain/matcher/matcher-registry"
import { createPatternGenerator } from "@/domain/pattern/pattern-generator"
import { patternPostProcessor } from "@/domain/pattern/pattern-postprocess"

const matcherRegistry = createMatcherRegistry([ciede2000Matcher])

export const patternGenerator = createPatternGenerator({
  cropper: imageCropper,
  sampler: averageGridSampler,
  matcherRegistry,
  postProcessor: patternPostProcessor,
})
