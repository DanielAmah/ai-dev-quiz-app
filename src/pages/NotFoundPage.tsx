import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/common/StateMessage';

export default function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="That page doesn’t exist."
      action={<Link to="/">Back to quizzes</Link>}
    />
  );
}
