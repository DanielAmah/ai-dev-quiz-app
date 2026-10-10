import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';
import { ErrorState } from './StateMessage';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Catches render-time errors anywhere below it so a bug in one screen shows a
 * recoverable fallback instead of a blank white page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error in UI:', error, info.componentStack);
  }

  private handleReset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 'var(--space-6)' }}>
          <ErrorState
            title="This screen hit an unexpected error"
            description="You can try again, or reload the page. Your saved progress is untouched."
            action={
              <Button variant="secondary" onClick={this.handleReset}>
                Try again
              </Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}
