import { AppErrorBoundary } from "@/components/common/AppErrorBoundary"
import { PatternWorkbench } from "@/components/pattern/PatternWorkbench"

export default function App() {
  return (
    <AppErrorBoundary>
      <PatternWorkbench />
    </AppErrorBoundary>
  )
}
