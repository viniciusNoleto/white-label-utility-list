import { Component, type ReactNode, type ErrorInfo } from 'react';
import i18n from '@/libs/i18n';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center h-screen gap-4 text-gray-500">
          <p className="text-lg font-semibold">
            {i18n.t('errorBoundary.title')}
          </p>

          <p className="text-sm">
            {i18n.t('errorBoundary.description')}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
