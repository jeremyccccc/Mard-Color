import type { ErrorInfo, ReactNode } from "react"
import { Component } from "react"

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  hasError: boolean
  message: string
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: "",
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App render failed", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="runtime-error-shell">
          <div className="runtime-error-card">
            <p className="eyebrow">Runtime Error</p>
            <h1>页面渲染失败</h1>
            <p>{this.state.message || "Unknown error"}</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
