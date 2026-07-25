import { Component, type ErrorInfo, type ReactNode } from 'react'
import ServerError from '@/pages/errors/ServerError'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return <ServerError onReset={() => this.setState({ hasError: false })} />
    }
    return this.props.children
  }
}
